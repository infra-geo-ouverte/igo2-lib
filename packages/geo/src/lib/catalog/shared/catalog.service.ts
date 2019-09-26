import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, of, zip } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { uuid } from '@igo2/utils';
import { LanguageService, ConfigService } from '@igo2/core';
import {
  CapabilitiesService,
  WMSDataSourceOptions,
  WMTSDataSourceOptions
} from '../../datasource';
import {
  LayerOptions,
  ImageLayerOptions,
  TooltipContent,
  TooltipType
} from '../../layer';
import { getResolutionFromScale } from '../../map';

import {
  Catalog,
  CatalogItem,
  CatalogItemLayer,
  CatalogItemGroup
} from './catalog.interface';
import { CatalogItemType } from './catalog.enum';
import { QueryHtmlTarget, QueryFormat } from '../../query';
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
        .pipe(catchError((response: HttpErrorResponse) => EMPTY));
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
      const catalogTooltipType = this.retrieveTooltipType(catalog);
      const layersQueryFormat = this.findCatalogInfoFormat(catalog);
      // TODO: Slice that into multiple methods
      // Define object of group layer
      const groupItem = {
        id: `catalog.group.${layerList.Name}`,
        type: CatalogItemType.Group,
        title: layerList.Title,
        items: layerList.Layer.reduce(
          (layers: CatalogItemLayer<ImageLayerOptions>[], layer: any) => {
            const configuredQueryFormat = this.retriveLayerInfoFormat(
              layer.Name,
              layersQueryFormat
            );

            if (this.testLayerRegexes(layer.Name, regexes) === false) {
              return layers;
            }

            const metadata = layer.DataURL ? layer.DataURL[0] : undefined;
            const abstract = layer.Abstract ? layer.Abstract : undefined;
            const keywordList = layer.KeywordList
              ? layer.KeywordList
              : undefined;
            const timeFilter = this.capabilitiesService.getTimeFilter(layer);
            const timeFilterable =
              timeFilter && Object.keys(timeFilter).length > 0 ? true : false;
            const legendOptions = layer.Style
              ? this.capabilitiesService.getStyle(layer.Style)
              : undefined;

            const params = Object.assign({}, catalogQueryParams, {
              layers: layer.Name,
              feature_count: catalog.count
            });
            const baseSourceOptions = {
              type: 'wms',
              url: catalog.url,
              crossOrigin: catalog.setCrossOriginAnonymous
                ? 'anonymous'
                : undefined,
              timeFilter: { ...timeFilter, ...catalog.timeFilter },
              timeFilterable: timeFilterable ? true : false,
              queryable: layer.queryable,
              queryFormat: configuredQueryFormat,
              queryHtmlTarget: catalog.queryHtmlTarget || QueryHtmlTarget.IFRAME
            };
            const sourceOptions = Object.assign(
              {},
              baseSourceOptions,
              catalogSourceOptions,
              { params }
            ) as WMSDataSourceOptions;

            layers.push({
              id: generateIdFromSourceOptions(sourceOptions),
              type: CatalogItemType.Layer,
              title: layer.Title,
              options: {
                title: layer.Title,
                maxResolution:
                  getResolutionFromScale(layer.MaxScaleDenominator) || Infinity,
                minResolution:
                  getResolutionFromScale(layer.MinScaleDenominator) || 0,
                metadata: {
                  url: metadata ? metadata.OnlineResource : undefined,
                  extern: metadata ? true : undefined,
                  abstract,
                  keywordList
                },
                legendOptions,
                tooltip: { type: catalogTooltipType } as TooltipContent,
                sourceOptions
              }
            });
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

        return {
          id: generateIdFromSourceOptions(sourceOptions),
          type: CatalogItemType.Layer,
          title: layer.Title,
          options: {
            title: layer.Title,
            sourceOptions
          }
        };
      })
      .filter((item: CatalogItemLayer | undefined) => item !== undefined);
  }

  private testLayerRegexes(layerName, regexes): boolean {
    if (regexes.length === 0) {
      return true;
    }
    return regexes.find((regex: RegExp) => regex.test(layerName)) !== undefined;
  }

  private retriveLayerInfoFormat(
    layerNameFromCatalog: string,
    layersQueryFormat: { layer: string; queryFormat: QueryFormat }[]
  ): QueryFormat {
    const currentLayerInfoFormat = layersQueryFormat.find(
      f => f.layer === layerNameFromCatalog
    );
    const baseInfoFormat = layersQueryFormat.find(f => f.layer === '*');
    let queryFormat: QueryFormat;
    if (currentLayerInfoFormat) {
      queryFormat = currentLayerInfoFormat.queryFormat;
    } else if (baseInfoFormat) {
      queryFormat = baseInfoFormat.queryFormat;
    }
    return queryFormat;
  }

  private retrieveTooltipType(catalog: Catalog): TooltipType {
    if (!catalog.tooltipType) {
      return TooltipType.TITLE;
    }
    return catalog.tooltipType;
  }

  private findCatalogInfoFormat(
    catalog: Catalog
  ): { layer: string; queryFormat: QueryFormat }[] {
    const layersQueryFormat: { layer: string; queryFormat: QueryFormat }[] = [];
    if (!catalog.queryFormat) {
      return layersQueryFormat;
    }
    Object.keys(catalog.queryFormat).forEach(configuredInfoFormat => {
      if (catalog.queryFormat[configuredInfoFormat] instanceof Array) {
        catalog.queryFormat[configuredInfoFormat].forEach(layerName => {
          if (
            !layersQueryFormat.find(specific => specific.layer === layerName)
          ) {
            layersQueryFormat.push({
              layer: layerName,
              queryFormat: configuredInfoFormat as QueryFormat
            });
          }
        });
      } else {
        if (
          !layersQueryFormat.find(
            specific =>
              specific.layer === catalog.queryFormat[configuredInfoFormat]
          )
        ) {
          layersQueryFormat.push({
            layer: catalog.queryFormat[configuredInfoFormat],
            queryFormat: configuredInfoFormat as QueryFormat
          });
        }
      }
    });
    return layersQueryFormat;
  }
}
