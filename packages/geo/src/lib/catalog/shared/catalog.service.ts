import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, of, zip } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { uuid, ObjectUtils } from '@igo2/utils';
import { LanguageService, ConfigService } from '@igo2/core';
import {
  CapabilitiesService,
  TypeCapabilities,
  WMSDataSourceOptions,
  WMSDataSourceOptionsParams,
  WMTSDataSourceOptions
} from '../../datasource';
import { LayerOptions, ImageLayerOptions } from '../../layer';
import { getResolutionFromScale } from '../../map';

import {
  CatalogItem,
  CatalogItemLayer,
  CatalogItemGroup
} from './catalog.interface';
import { Catalog, CatalogFactory, CompositeCatalog } from './catalog.abstract';
import { CatalogItemType, TypeCatalog } from './catalog.enum';
import { QueryFormat } from '../../query';
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
    let newCatalog: Catalog;
    newCatalog = CatalogFactory.createInstanceCatalog(catalog, this);
    return newCatalog.collectCatalogItems();
  }

  loadCatalogBaseLayerItems(catalog: Catalog): Observable<CatalogItemGroup[]> {
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

  loadCatalogWMSLayerItems(catalog: Catalog): Observable<CatalogItem[]> {
    return this.getCatalogCapabilities(catalog).pipe(
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

  loadCatalogWMTSLayerItems(catalog: Catalog): Observable<CatalogItem[]> {
    return this.getCatalogCapabilities(catalog).pipe(
      map((capabilities: any) => this.getWMTSItems(catalog, capabilities))
    );
  }

  loadCatalogCompositeLayerItems(catalog: Catalog): Observable<CatalogItem[]> {
    const compositeCatalog = (catalog as CompositeCatalog).composite;

    const catalogsFromInstance = [] as Catalog[];
    compositeCatalog.map((component: Catalog) =>
      catalogsFromInstance.push(
        CatalogFactory.createInstanceCatalog(component, this)
      )
    );

    // get CatalogItems for each original Catalog-----------------------------------------------------
    const request1$ = [];
    catalogsFromInstance.map((component: Catalog) =>
      request1$.push(component.collectCatalogItems())
    );

    // integrate imposed group -----------------------------------------------------
    let request2$ = [];

    function flatDeepLayer(arr) {
      return arr.reduce(
        (acc, val) =>
          acc.concat(
            val.type === CatalogItemType.Group ? flatDeepLayer(val.items) : val
          ),
        []
      );
    }

    if (
      Object.keys(compositeCatalog).find(k => compositeCatalog[k].groupImpose)
    ) {
      const pushImposeGroup = (item, index) => {
        const c = catalogsFromInstance[index];
        const outGroupImpose = Object.assign({}, c.groupImpose);
        outGroupImpose.address = c.id;
        outGroupImpose.type = CatalogItemType.Group;
        outGroupImpose.items = [];

        const flatLayer = flatDeepLayer(item);
        flatLayer.map(
          v => (v.address = `${outGroupImpose.address}.${outGroupImpose.id}`)
        );
        outGroupImpose.items = flatLayer;

        return outGroupImpose;
      };

      request2$ = request1$.map((obs, idx) =>
        obs.pipe(
          map(items =>
            compositeCatalog[idx].groupImpose
              ? pushImposeGroup(items, idx)
              : items
          )
        )
      );
    } else {
      request2$ = request1$;
    }

    // concat Group -----------------------------------------------------
    const request3$ = zip(...request2$).pipe(
      map(
        (output: CatalogItem[]) => [].concat(...output) // [].concat.apply([], result1
      )
    );

    // merge Group (first level only) -----------------------------------------------------
    const groupByGroupId = (data, keyFn) =>
      data.reduce((acc, group) => {
        const groupId = keyFn(group);
        const ind = acc.find(x => x.id === groupId);

        if (!ind) {
          acc[acc.length] = group;
        } else {
          const ix = acc.indexOf(ind);
          if (acc[ix].address.split('|').indexOf(group.address) === -1) {
            acc[ix].address = `${acc[ix].address}|${group.address}`;
          }
          acc[ix].items.push(...group.items);
        }
        return acc;
      }, []);

    // merge Layer for each Level (catalog, group(recursive))
    const recursiveGroupByLayerAddress = (items, keyFn) =>
      items.reduce((acc, item, idx, arr) => {
        const layerTitle = keyFn(item);
        const outItem = Object.assign({}, item);

        if (item.type === CatalogItemType.Layer) {
          // same title, same address => result: only one item is keep

          // same title, address diff
          const indicesMatchTitle = [];
          const diffAddress = arr.filter((x, i) => {
            let bInd = false;
            if (x.title === layerTitle && x.type === CatalogItemType.Layer) {
              if (i !== idx && x.address !== item.address) {
                bInd = true;
              }
              indicesMatchTitle.push(i);
            }
            return bInd;
          }); // $& i !== idx

          if (diffAddress.length > 0) {
            const nPosition = indicesMatchTitle.findIndex(x => x === idx) + 1;
            outItem.title = `${item.title} (${nPosition})`; // source: ${item.address.split('.')[0]}
          }

          const exist = acc.find(
            x => x.title === outItem.title && x.type === CatalogItemType.Layer
          );
          if (!exist) {
            acc[acc.length] = outItem;
          }
        } else if (item.type === CatalogItemType.Group) {
          outItem.items = recursiveGroupByLayerAddress(
            item.items,
            layer => layer.title
          );
          acc[acc.length] = outItem;
        }

        return acc;
      }, []);

    const request4$ = request3$.pipe(
      map(output => groupByGroupId(output, group => group.id)),
      map(output => [].concat(...output)),
      map(data => recursiveGroupByLayerAddress(data, layer => layer.title))
    );

    return request4$;
  }

  private getCatalogCapabilities(catalog: Catalog): Observable<any> {
    const sType: string = TypeCatalog[catalog.type as string];
    return this.capabilitiesService.getCapabilities(
      TypeCapabilities[sType],
      catalog.url,
      catalog.version
    );
  }

  private prepareCatalogItemLayer(layer, idParent, layersQueryFormat, catalog) {
    const configuredQueryFormat = this.retriveLayerInfoFormat(
      layer.Name,
      layersQueryFormat
    );

    const metadata = layer.DataURL ? layer.DataURL[0] : undefined;
    const legendOptions =
      catalog.showLegend && layer.Style
        ? this.capabilitiesService.getStyle(layer.Style)
        : undefined;

    const params = Object.assign({}, catalog.queryParams, {
      LAYERS: layer.Name,
      VERSION: catalog.version
    } as WMSDataSourceOptionsParams);

    const baseSourceOptions = {
      type: 'wms',
      url: catalog.url,
      crossOrigin: catalog.setCrossOriginAnonymous ? 'anonymous' : undefined,
      queryFormat: configuredQueryFormat,
      queryHtmlTarget:
        configuredQueryFormat === QueryFormat.HTML ||
        configuredQueryFormat === QueryFormat.HTMLGML2
          ? 'iframe'
          : undefined,
      optionsFromCapabilities: true
    };

    const sourceOptions = Object.assign(
      {},
      baseSourceOptions,
      catalog.sourceOptions,
      { params }
    ) as WMSDataSourceOptions;

    const layerPrepare = {
      id: generateIdFromSourceOptions(sourceOptions),
      type: CatalogItemType.Layer,
      title: layer.Title,
      address: idParent,
      options: {
        maxResolution: getResolutionFromScale(layer.MaxScaleDenominator),
        minResolution: getResolutionFromScale(layer.MinScaleDenominator),
        metadata: {
          url: metadata ? metadata.OnlineResource : undefined,
          extern: metadata ? true : undefined
        },
        legendOptions,
        tooltip: { type: catalog.tooltipType },
        sourceOptions
      }
    };

    return ObjectUtils.removeUndefined(layerPrepare);
  }

  private prepareCatalogItemGroup(
    itemListIn,
    regexes,
    idGroup,
    layersQueryFormat,
    catalog
  ) {
    const groupPrepare = {
      id: idGroup,
      type: CatalogItemType.Group,
      title: itemListIn.Title,
      address: catalog.id,
      items: itemListIn.Layer.reduce((items: CatalogItem[], layer: any) => {
        if (layer.Layer !== undefined) {
          // recursive, check next level
          const idGroupItemNextLevel =
            idGroup + `.group.${layer.Name || layer.Layer[0].Name}`;
          const groupItem: CatalogItemGroup = this.prepareCatalogItemGroup(
            layer,
            regexes,
            idGroupItemNextLevel,
            layersQueryFormat,
            catalog
          );

          items.push(groupItem);
        } else {
          if (this.testLayerRegexes(layer.Name, regexes) === false) {
            return items;
          }

          const layerItem: CatalogItemLayer<
            ImageLayerOptions
          > = this.prepareCatalogItemLayer(
            layer,
            idGroup,
            layersQueryFormat,
            catalog
          );

          items.push(layerItem);
        }
        return items;
      }, [])
    };
    return groupPrepare;
  }

  private includeRecursiveItems(
    catalog: Catalog,
    itemListIn: any,
    itemsPrepare: CatalogItem[],
    loopLevel: number = 0
  ) {
    // Dig all levels until last level (layer object are not defined on last level)
    const regexes = (catalog.regFilters || []).map(
      (pattern: string) => new RegExp(pattern)
    );
    if (!itemListIn.Layer) {
      return;
    }

    for (const item of itemListIn.Layer) {
      if (item.Layer !== undefined) {
        // recursive, check next level
        this.includeRecursiveItems(catalog, item, itemsPrepare, loopLevel + 1);
        continue;
      }

      const layersQueryFormat = this.findCatalogInfoFormat(catalog);

      // group(with layers) and layer(without group) level 1
      if (loopLevel !== 0) {
        // TODO: Slice that into multiple methods
        // Define object of group layer
        const idGroupItem = `catalog.group.${itemListIn.Name || item.Name}`;
        const groupItem = this.prepareCatalogItemGroup(
          itemListIn,
          regexes,
          idGroupItem,
          layersQueryFormat,
          catalog
        );

        if (groupItem.items.length !== 0) {
          itemsPrepare.push(groupItem);
        }

        // Break the group (don't add a group of layer for each of their layer!)
        break;
      } else {
        // layer without group
        if (this.testLayerRegexes(item.Name, regexes) !== false) {
          const layerItem = this.prepareCatalogItemLayer(
            item,
            catalog.id,
            layersQueryFormat,
            catalog
          );
          itemsPrepare.push(layerItem);
        }
      }
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

    return layers
      .map((layer: any) => {
        if (this.testLayerRegexes(layer.Identifier, regexes) === false) {
          return undefined;
        }
        const params = Object.assign({}, catalog.queryParams, {
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
          catalog.sourceOptions,
          { params }
        ) as WMTSDataSourceOptions;

        return ObjectUtils.removeUndefined({
          id: generateIdFromSourceOptions(sourceOptions),
          type: CatalogItemType.Layer,
          title: layer.Title,
          address: catalog.id,
          options: {
            sourceOptions
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
