import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, of, concat } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { LanguageService, ConfigService } from '@igo2/core';
import { CapabilitiesService, WMSDataSourceOptions, generateIdFromSourceOptions } from '../../datasource';
import { LayerOptions, ImageLayerOptions } from '../../layer';
import { getResolutionFromScale } from '../../map';

import {
  Catalog,
  CatalogItem,
  CatalogItemLayer,
  CatalogItemGroup
} from './catalog.interface';
import { CatalogItemType } from './catalog.enum';

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

    if (apiUrl === undefined) {
      return of(catalogsFromConfig);
    }

    const observables$ = [];

    // Base layers catalog
    if (catalogConfig.baseLayers) {
      const translate = this.languageService.translate;
      const title = translate.instant('igo.geo.catalog.baseLayers');
      const baseLayersCatalog = {
        id: 'catalog.baselayers',
        title,
        url: `${apiUrl}/baselayers`,
        type: 'baselayers'
      };
      observables$.push(of(baseLayersCatalog));
    }

    // Catalogs from API
    const catalogsFromApi$ = this.http
      .get<Catalog[]>(`${apiUrl}/catalogs`)
      .pipe(
        catchError((response: HttpErrorResponse) => EMPTY)
      );
    observables$.push(catalogsFromApi$);

    // Catalogs from config
    if (catalogsFromConfig.length > 0) {
      observables$.push(of(catalogsFromConfig));
    }

    return concat(...observables$) as Observable<Catalog[]>;
  }

  loadCatalogItems(catalog: Catalog): Observable<CatalogItem[]> {
    if (catalog.type === 'baselayers') {
      return this.loadCatalogBaseLayerItems(catalog);
    }
    return this.loadCatalogWMSLayerItems(catalog);
  }

  private loadCatalogBaseLayerItems(catalog: Catalog): Observable<CatalogItemGroup[]> {
    // TODO: I'm not sure this works
    return this.getCatalogBaseLayersOptions(catalog)
      .pipe(
        map((layersOptions: LayerOptions[]) => {
          const items = layersOptions.map((layerOptions: LayerOptions) => {
            return {
              id: generateIdFromSourceOptions(layerOptions.sourceOptions),
              title: layerOptions.title,
              type: CatalogItemType.Layer,
              options: layerOptions
            } as CatalogItemLayer;
          });
          return [{
            id: 'catalog.group.baselayers',
            type: CatalogItemType.Group,
            title: catalog.title,
            items
          }];
        })
      );
  }

  private getCatalogBaseLayersOptions(catalog: Catalog): Observable<LayerOptions[]> {
    return this.http.get<LayerOptions[]>(catalog.url);
  }

  private loadCatalogWMSLayerItems(catalog: Catalog): Observable<CatalogItem[]> {
    return this.getCatalogWMSCapabilities(catalog)
      .pipe(
        map((capabilities: any) => {
          const items = [];
          this.includeRecursiveItems(catalog, capabilities.Capability.Layer, items);
          return items;
        })
      );
  }

  private getCatalogWMSCapabilities(catalog: Catalog): Observable<any> {
    return this.capabilitiesService.getCapabilities('wms', catalog.url);
  }

  private includeRecursiveItems(catalog: Catalog, layerList: any, items: CatalogItem[]) {
    // Dig all levels until last level (layer object are not defined on last level)
    for (const group of layerList.Layer) {
      if (group.Layer !== undefined) {
        // recursive, check next level
        this.includeRecursiveItems(catalog, group, items);
        continue;
      }

      // TODO: Slice that into multiple methods
      // Define object of group layer
      const groupItem = {
        id: `catalog.group.${layerList.Name}`,
        type: CatalogItemType.Group,
        title: layerList.Title,
        items: layerList.Layer.reduce((layers: CatalogItemLayer<ImageLayerOptions>[], layer: any) => {
          let regFiltersPassed = true;
          if (catalog.regFilters !== undefined) {
            // Test layer.Name for each regex define in config.json
            regFiltersPassed = catalog.regFilters.find((regFilter: string) => {
              return new RegExp(regFilter).test(layer.Name);
            }) !== undefined;
          }

          if (regFiltersPassed === false) {
            return layers;
          }

          const metadata = layer.DataURL ? layer.DataURL[0] : undefined;
          const abstract = layer.Abstract ? layer.Abstract : undefined;
          const keywordList = layer.KeywordList ? layer.KeywordList : undefined;
          const timeFilter = this.capabilitiesService.getTimeFilter(layer);
          const timeFilterable = timeFilter && Object.keys(timeFilter).length > 0 ? true : false;

          const sourceOptions = {
            type: 'wms',
            url: catalog.url,
            params: {
              layers: layer.Name,
              feature_count:  catalog.count
            },
            timeFilter: { ...timeFilter, ...catalog.timeFilter },
            timeFilterable: timeFilterable ? true : false,
            queryable: layer.queryable,
            queryFormat: catalog.queryFormat,
            queryHtmlTarget: catalog.queryHtmlTarget || 'innerhtml'
          } as WMSDataSourceOptions;

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
              sourceOptions
            }
          });
          return layers;

        }, [])

      };
      /* If object contain layers (when regFilters is define, the condition
      in Layer.map can define group with no layer) */
      if (groupItem.items.length !== 0) {
        items.push(groupItem);
      }
      // Break the group (don't add a group of layer for each of their layer!)
      break;
    }
  }

}
