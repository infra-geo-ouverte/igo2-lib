import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, of, zip } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { uuid, ObjectUtils } from '@igo2/utils';
import { LanguageService, ConfigService } from '@igo2/core';
import {
  CapabilitiesService,
  WMSDataSourceOptions,
  WMTSDataSourceOptions,
  WMSDataSourceOptionsParams
} from '../../datasource';
import { LayerOptions, ImageLayerOptions } from '../../layer';
import { getResolutionFromScale } from '../../map';

import {
  Catalog,
  CatalogItem,
  CatalogItemLayer,
  CatalogItemGroup
} from './catalog.interface';
import { CatalogItemType } from './catalog.enum';
import { generateIdFromSourceOptions } from '../../utils';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private languageService: LanguageService,
    private capabilitiesService: CapabilitiesService
  ) {}

  loadCatalogs(): Observable<Catalog[]> {
    const contextConfig = this.config.getConfig('context') || {};
    const catalogConfig = this.config.getConfig('catalog') || {};
    const apiUrl = catalogConfig.url || contextConfig.url;
    const catalogsFromConfig = catalogConfig.sources || [];

    const observables$ = [];

    if (apiUrl) {
      // Base layers catalog
      if (catalogConfig.baseLayers) {
        const translate = this.languageService.translate;
        const title = translate.instant('igo.geo.catalog.baseLayers');
        const baseLayersCatalog = [
          {
            id: 'catalog.baselayers',
            title,
            url: `${apiUrl}/baselayers`,
            type: 'baselayers'
          }
        ];
        observables$.push(of(baseLayersCatalog));
      }

      // Catalogs from API
      const catalogsFromApi$ = this.http
        .get<Catalog[]>(`${apiUrl}/catalogs`)
        .pipe(
          map(catalogs =>
            catalogs.map((c: any) => Object.assign(c, c.options))
          ),
          catchError((_response: HttpErrorResponse) => EMPTY)
        );
      observables$.push(catalogsFromApi$);
    }

    // Catalogs from config
    if (catalogsFromConfig.length > 0) {
      observables$.push(
        of(catalogsFromConfig).pipe(
          map((catalogs: Catalog[]) =>
            catalogs.map(c => {
              if (!c.id) {
                c.id = uuid();
              }
              return c;
            })
          )
        )
      );
    }

    return zip(...observables$).pipe(
      map((catalogs: Catalog[][]) => [].concat.apply([], catalogs))
    ) as Observable<Catalog[]>;
  }

  loadCatalogItems(catalog: Catalog): Observable<CatalogItem[]> {
    if (catalog.type === 'baselayers') {
      return this.loadCatalogBaseLayerItems(catalog);
    } else if (catalog.type === 'wmts') {
      return this.loadCatalogWMTSLayerItems(catalog);
    }
    return this.loadCatalogWMSLayerItems(catalog);
  }

  private loadCatalogBaseLayerItems(
    catalog: Catalog
  ): Observable<CatalogItemGroup[]> {
    return this.getCatalogBaseLayersOptions(catalog).pipe(
      map((layersOptions: LayerOptions[]) => {
        const items = layersOptions.map((layerOptions: LayerOptions) => {
          return {
            id: generateIdFromSourceOptions(layerOptions.sourceOptions),
            title: layerOptions.title,
            type: CatalogItemType.Layer,
            options: layerOptions
          } as CatalogItemLayer;
        });
        return [
          {
            id: 'catalog.group.baselayers',
            type: CatalogItemType.Group,
            title: catalog.title,
            items
          }
        ];
      })
    );
  }

  private getCatalogBaseLayersOptions(
    catalog: Catalog
  ): Observable<LayerOptions[]> {
    return this.http.get<LayerOptions[]>(catalog.url);
  }

  private loadCatalogWMSLayerItems(
    catalog: Catalog
  ): Observable<CatalogItem[]> {
    return this.getCatalogWMSCapabilities(catalog).pipe(
      map((capabilities: any) => {
        const items = [];
        this.includeRecursiveItems(
          catalog,
          capabilities.Capability.Layer,
          items
        );
        return items;
      })
    );
  }

  private loadCatalogWMTSLayerItems(
    catalog: Catalog
  ): Observable<CatalogItem[]> {
    return this.getCatalogWMTSCapabilities(catalog).pipe(
      map((capabilities: any) => this.getWMTSItems(catalog, capabilities))
    );
  }

  private getCatalogWMSCapabilities(catalog: Catalog): Observable<any> {
    return this.capabilitiesService.getCapabilities(
      'wms',
      catalog.url,
      catalog.version
    );
  }

  private getCatalogWMTSCapabilities(catalog: Catalog): Observable<any> {
    return this.capabilitiesService.getCapabilities(
      'wmts',
      catalog.url,
      catalog.version
    );
  }

  private includeRecursiveItems(
    catalog: Catalog,
    layerList: any,
    items: CatalogItem[]
  ) {
    // Dig all levels until last level (layer object are not defined on last level)
    const regexes = (catalog.regFilters || []).map(
      (pattern: string) => new RegExp(pattern)
    );
    const catalogQueryParams = catalog.queryParams || {};
    const catalogSourceOptions = catalog.sourceOptions || {};

    if (!layerList.Layer) {
      return;
    }

    for (const group of layerList.Layer) {
      if (group.Layer !== undefined) {
        // recursive, check next level
        this.includeRecursiveItems(catalog, group, items);
        continue;
      }
      // TODO: Slice that into multiple methods
      // Define object of group layer
      const groupItem = {
        id: `catalog.group.${layerList.Name || group.Name}`,
        type: CatalogItemType.Group,
        title: layerList.Title,
        items: layerList.Layer.reduce(
          (layers: CatalogItemLayer<ImageLayerOptions>[], layer: any) => {
            if (this.testLayerRegexes(layer.Name, regexes) === false) {
              return layers;
            }

            const legendOptions =
              catalog.showLegend && layer.Style
                ? this.capabilitiesService.getStyle(layer.Style)
                : undefined;

            const metadata = layer.DataURL ? layer.DataURL[0] : undefined;

            const params = Object.assign({}, catalogQueryParams, {
              LAYERS: layer.Name,
              FEATURE_COUNT: catalog.count,
              VERSION: catalog.version
            } as WMSDataSourceOptionsParams);

            const baseSourceOptions = {
              type: 'wms',
              url: catalog.url,
              crossOrigin: catalog.setCrossOriginAnonymous
                ? 'anonymous'
                : undefined,
              timeFilter: catalog.timeFilter,
              queryHtmlTarget: catalog.queryHtmlTarget,
              optionsFromCapabilities: true
            };

            const sourceOptions = Object.assign(
              {},
              baseSourceOptions,
              catalogSourceOptions,
              { params }
            ) as WMSDataSourceOptions;

            layers.push(
              ObjectUtils.removeUndefined({
                id: generateIdFromSourceOptions(sourceOptions),
                type: CatalogItemType.Layer,
                title: layer.Title,
                options: {
                  maxResolution:
                    getResolutionFromScale(layer.MaxScaleDenominator) ||
                    Infinity,
                  minResolution:
                    getResolutionFromScale(layer.MinScaleDenominator) || 0,
                  metadata: {
                    url: metadata ? metadata.OnlineResource : undefined,
                    extern: metadata ? true : undefined
                  },
                  legendOptions,
                  tooltip: { type: catalog.tooltipType },
                  sourceOptions
                }
              })
            );
            return layers;
          },
          []
        )
      };

      if (groupItem.items.length !== 0) {
        items.push(groupItem);
      }

      // Break the group (don't add a group of layer for each of their layer!)
      break;
    }
  }

  private getWMTSItems(
    catalog: Catalog,
    capabilities: { [key: string]: any }
  ): CatalogItemLayer[] {
    const layers = capabilities.Contents.Layer;
    const regexes = (catalog.regFilters || []).map(
      (pattern: string) => new RegExp(pattern)
    );
    const catalogQueryParams = catalog.queryParams || {};
    const catalogSourceOptions = catalog.sourceOptions || {};

    return layers
      .map((layer: any) => {
        if (this.testLayerRegexes(layer.Identifier, regexes) === false) {
          return undefined;
        }
        const params = Object.assign({}, catalogQueryParams, {
          version: '1.0.0'
        });
        const baseSourceOptions = {
          type: 'wmts',
          url: catalog.url,
          crossOrigin: catalog.setCrossOriginAnonymous
            ? 'anonymous'
            : undefined,
          layer: layer.Identifier,
          matrixSet: catalog.matrixSet,
          optionsFromCapabilities: true,
          requestEncoding: catalog.requestEncoding || 'KVP',
          style: 'default'
        } as WMTSDataSourceOptions;
        const sourceOptions = Object.assign(
          {},
          baseSourceOptions,
          catalogSourceOptions,
          { params }
        ) as WMTSDataSourceOptions;

        return ObjectUtils.removeUndefined({
          id: generateIdFromSourceOptions(sourceOptions),
          type: CatalogItemType.Layer,
          title: layer.Title,
          options: {
            sourceOptions,
            maxResolution: Infinity,
            minResolution: 0
          }
        });
      })
      .filter((item: CatalogItemLayer | undefined) => item !== undefined);
  }

  private testLayerRegexes(layerName: string, regexes: RegExp[]): boolean {
    if (regexes.length === 0) {
      return true;
    }
    return regexes.find((regex: RegExp) => regex.test(layerName)) !== undefined;
  }

  // private retriveLayerInfoFormat(
  //   layerNameFromCatalog: string,
  //   layersQueryFormat: { layer: string; queryFormat: QueryFormat }[]
  // ): QueryFormat {
  //   const currentLayerInfoFormat = layersQueryFormat.find(
  //     f => f.layer === layerNameFromCatalog
  //   );
  //   const baseInfoFormat = layersQueryFormat.find(f => f.layer === '*');
  //   let queryFormat: QueryFormat;
  //   if (currentLayerInfoFormat) {
  //     queryFormat = currentLayerInfoFormat.queryFormat;
  //   } else if (baseInfoFormat) {
  //     queryFormat = baseInfoFormat.queryFormat;
  //   }
  //   return queryFormat;
  // }
}
