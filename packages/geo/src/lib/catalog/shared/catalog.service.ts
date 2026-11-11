import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import { ObjectUtils, removeQueryParameters, uuid } from '@igo2/utils';

import { EMPTY, Observable, of, zip } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  GetCapabilitiesParams,
  TypeCapabilitiesStrings
} from '../../datasource/shared/capabilities.interface';
import { CapabilitiesService } from '../../datasource/shared/capabilities.service';
import {
  WMSDataSourceOptions,
  WMSDataSourceOptionsParams,
  WMTSDataSourceOptions
} from '../../datasource/shared/datasources';
import { ImageLayerOptions, LayerOptions } from '../../layer/shared';
import { getResolutionFromScale } from '../../map/shared/map.utils';
import { QueryFormat } from '../../query/shared/query.enums';
import { generateIdFromSourceOptions } from '../../utils/id-generator';
import { ArcgisCatalog } from './arcgis-catalog.service';
import { Catalog } from './catalog.abstract';
import {
  CatalogItemType,
  CatalogQueryFormatTypes,
  TypeCatalog
} from './catalog.enum';
import {
  CatalogItem,
  CatalogItemGroup,
  CatalogItemLayer,
  CatalogServiceOptions,
  ICatalog,
  ICompositeCatalog,
  WmsCapabilityLayer,
  WmtsCapabilities,
  WmtsCapabilityLayer
} from './catalog.interface';
import { computeForcedProperties, testLayerRegexes } from './catalog.utils';
import {
  ArcGISRestCatalog,
  BaselayersCatalog,
  CompositeCatalog,
  TileOrImageArcGISRestCatalog,
  WMSCatalog,
  WMTSCatalog
} from './catalogs';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);
  private languageService = inject(LanguageService);
  private messageService = inject(MessageService);
  private capabilitiesService = inject(CapabilitiesService);
  private arcgisCatalog = inject(ArcgisCatalog);

  loadCatalogs(): Observable<Catalog[]> {
    const contextConfig = this.config.getConfig('context') || {};

    const catalogConfig: CatalogServiceOptions =
      this.config.getConfig('catalog') || {};
    const apiUrl = catalogConfig.url || contextConfig.url;
    const catalogsFromConfig = catalogConfig.sources || [];

    const observables$: Observable<(ICatalog | ICompositeCatalog)[]>[] = [];

    if (apiUrl) {
      if (catalogConfig.baselayers) {
        const translate = this.languageService.translate;
        const title = translate.instant('igo.geo.catalog.baseLayers');
        const baseLayersCatalog: ICatalog[] = [
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
          map((catalogs) =>
            catalogs.map((c: any) => Object.assign(c, c.options))
          ),
          catchError(() => EMPTY)
        );
      observables$.push(catalogsFromApi$);
    }

    // Catalogs from config
    if (catalogsFromConfig.length > 0) {
      observables$.push(
        of(catalogsFromConfig).pipe(
          map((catalogs) =>
            catalogs.map((c) => {
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
      map((catalogs) => catalogs.flat())
    ) as Observable<Catalog[]>;
  }

  loadCatalogItems(catalog: Catalog): Observable<CatalogItem[]> {
    const newCatalog = CatalogFactory.createInstanceCatalog(catalog, this);
    return newCatalog.collectCatalogItems();
  }

  loadCatalogBaseLayerItems(catalog: Catalog): Observable<CatalogItemGroup[]> {
    return this.getCatalogBaseLayersOptions(catalog).pipe(
      map((layersOptions: LayerOptions[]) => {
        const items = layersOptions.map((layerOptions: LayerOptions) => {
          return {
            id: generateIdFromSourceOptions(layerOptions.sourceOptions!),
            title: layerOptions.title,
            type: CatalogItemType.Layer,
            externalProvider: catalog.externalProvider,
            options: layerOptions
          } as CatalogItemLayer;
        });
        return [
          {
            id: 'catalog.group.baselayers',
            type: CatalogItemType.Group,
            externalProvider: catalog.externalProvider,
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
        const items: CatalogItem[] = [];
        if (!capabilities) {
          return items;
        }
        if (
          capabilities.Service &&
          capabilities.Service.Abstract &&
          capabilities.Service.Abstract.length
        ) {
          catalog.abstract = capabilities.Service.Abstract;
        }
        const finalLayers: WmsCapabilityLayer[] = [];
        this.flattenWmsCapabilities(
          capabilities.Capability.Layer,
          0,
          finalLayers,
          catalog.groupSeparator
        );
        const capabilitiesCapabilityLayer = Object.assign(
          {},
          capabilities.Capability.Layer
        );
        capabilitiesCapabilityLayer.Layer = finalLayers.filter(
          (f) => (f.Layer?.length ?? 0) !== 0
        );
        this.includeRecursiveItems(catalog, capabilitiesCapabilityLayer, items);
        return items;
      }),
      catchError(() => {
        this.showError(catalog);
        return EMPTY;
      })
    );
  }

  flattenWmsCapabilities(
    parent: WmsCapabilityLayer,
    level = 0,
    finalLayers: WmsCapabilityLayer[],
    separator = ' / '
  ) {
    const parentInFinalLayers = finalLayers.find(
      (f) => f.Title === parent.Title
    );
    if (!parentInFinalLayers) {
      const modifiedParent = Object.assign({}, parent);
      modifiedParent.Layer = [];
      finalLayers.push(modifiedParent);
    }
    for (const layer of parent.Layer ?? []) {
      const modifiedLayer = Object.assign({}, layer);
      if (level > 0) {
        modifiedLayer.Title = parent.Title + separator + layer.Title;
      }
      if (layer.Layer) {
        this.flattenWmsCapabilities(
          modifiedLayer,
          level + 1,
          finalLayers,
          separator
        );
      } else {
        const parentEntry = finalLayers.find((ff) => ff.Title === parent.Title);
        if (parentEntry?.Layer) {
          parentEntry.Layer.push(layer);
        }
      }
    }
  }

  loadCatalogWMTSLayerItems(catalog: Catalog): Observable<CatalogItem[]> {
    return this.getCatalogCapabilities(catalog).pipe(
      map((capabilities) =>
        this.getWMTSItems(catalog, capabilities as unknown as WmtsCapabilities)
      )
    );
  }

  loadCatalogArcGISRestItems(catalog: Catalog): Observable<CatalogItem[]> {
    return this.getCatalogCapabilities(catalog).pipe(
      map((capabilities: any) => {
        if (!capabilities || capabilities.error) {
          this.showError(catalog);
          return [];
        }
        const items = this.arcgisCatalog.read(catalog, capabilities);
        if (!items || items.length === 0) {
          this.showError(catalog);
          return [];
        }
        return items;
      })
    );
  }

  private showError(catalog: Catalog) {
    this.messageService.error(
      catalog.title
        ? 'igo.geo.catalog.unavailable'
        : 'igo.geo.catalog.someUnavailable',
      'igo.geo.catalog.unavailableTitle',
      undefined,
      catalog.title ? { value: catalog.title } : undefined
    );
  }

  loadCatalogCompositeLayerItems(catalog: Catalog): Observable<CatalogItem[]> {
    const compositeCatalog = (catalog as CompositeCatalog).composite;

    const catalogsFromInstance = [] as Catalog[];
    compositeCatalog.map((component) => {
      component.sortDirection = catalog.sortDirection; // propagate sortDirection with parent value
      catalogsFromInstance.push(
        CatalogFactory.createInstanceCatalog(component, this)
      );
    });

    // get CatalogItems for each original Catalog-----------------------------------------------------
    const request1$: Observable<CatalogItem[]>[] = [];
    catalogsFromInstance.map((component: Catalog) =>
      request1$.push(component.collectCatalogItems())
    );

    // integrate imposed group -----------------------------------------------------
    let request2$: Observable<CatalogItem[] | CatalogItemGroup>[];

    function flatDeepLayer(arr: CatalogItem[]): CatalogItemLayer[] {
      return arr.reduce<CatalogItemLayer[]>(
        (acc, val) =>
          acc.concat(
            val.type === CatalogItemType.Group
              ? flatDeepLayer((val as CatalogItemGroup).items ?? [])
              : [val as CatalogItemLayer]
          ),
        []
      );
    }

    if (
      Object.keys(compositeCatalog).find(
        (k) => (compositeCatalog as ICatalog[])[Number(k)].groupImpose
      )
    ) {
      const pushImposeGroup = (
        item: CatalogItem[],
        index: number
      ): CatalogItemGroup => {
        const c = catalogsFromInstance[index];
        const outGroupImpose: CatalogItemGroup = Object.assign(
          {},
          c.groupImpose
        );
        outGroupImpose.address = c.id;
        outGroupImpose.type = CatalogItemType.Group;
        outGroupImpose.externalProvider = c.externalProvider;
        if (outGroupImpose.sortDirection === undefined) {
          outGroupImpose.sortDirection = c.sortDirection;
        }
        outGroupImpose.items = [];

        const flatLayer = flatDeepLayer(item);
        flatLayer.map(
          (v) => (v.address = `${outGroupImpose.address}.${outGroupImpose.id}`)
        );
        outGroupImpose.items = flatLayer;

        return outGroupImpose;
      };

      request2$ = request1$.map((obs, idx) =>
        obs.pipe(
          map((items) =>
            (compositeCatalog as ICatalog[])[idx].groupImpose
              ? pushImposeGroup(items, idx)
              : items
          )
        )
      );
    } else {
      request2$ = request1$;
    }

    // concat Group -----------------------------------------------------
    const request3$ = zip(...request2$).pipe(map((output) => output.flat()));

    // merge Group (first level only) -----------------------------------------------------
    const groupByGroupId = (
      data: CatalogItem[],
      keyFn: (item: CatalogItem) => string
    ): CatalogItemGroup[] =>
      data.reduce<CatalogItemGroup[]>((acc, group) => {
        const groupId = keyFn(group);
        const ind = acc.find((x) => x.id === groupId);

        if (!ind) {
          acc[acc.length] = group as CatalogItemGroup;
        } else {
          const ix = acc.indexOf(ind);
          const grouped = acc[ix] as CatalogItemGroup & { address: string };
          if (
            grouped.address
              .split('|')
              .indexOf(
                (group as CatalogItemGroup & { address: string }).address
              ) === -1
          ) {
            grouped.address = `${grouped.address}|${(group as CatalogItemGroup & { address: string }).address}`;
          }
          grouped.items?.push(...((group as CatalogItemGroup).items ?? []));
        }
        return acc;
      }, []);

    // merge Layer for each Level (catalog, group(recursive))
    const recursiveGroupByLayerAddress = (
      items: CatalogItem[],
      keyFn: (item: CatalogItem) => string
    ): CatalogItem[] =>
      items.reduce<CatalogItem[]>((acc, item, idx, arr) => {
        const layerTitle = keyFn(item);
        const outItem = Object.assign({}, item);

        if (item.type === CatalogItemType.Layer) {
          // same title, same address => result: only one item is kept

          // same title, address diff
          const indicesMatchTitle: number[] = [];
          const indicesMatchNewMetadataUrl: number[] = []; // metadata
          const diffAddress = arr.filter((x, i) => {
            let bInd = false;
            if (x.title === layerTitle && x.type === CatalogItemType.Layer) {
              if (
                i !== idx &&
                (x as CatalogItemLayer).address !==
                  (item as CatalogItemLayer).address
              ) {
                bInd = true;
              }
              indicesMatchTitle.push(i);
            }
            return bInd;
          }); // $& i !== idx

          if (diffAddress.length > 0) {
            let nPosition = indicesMatchTitle.findIndex((x) => x === idx) + 1;
            outItem.title = `${item.title} (${nPosition})`; // source: ${item.address.split('.')[0]}
            nPosition =
              indicesMatchNewMetadataUrl.findIndex((x) => x === idx) + 1;
            (
              outItem as CatalogItemLayer & { newMetadataUrl?: string }
            ).newMetadataUrl =
              `${(item as CatalogItemLayer & { newMetadataUrl?: string }).newMetadataUrl} (${nPosition})`; // source: ${item.address.split('.')[0]}
          }

          const exist = acc.find(
            (x) => x.title === outItem.title && x.type === CatalogItemType.Layer
          );
          if (!exist) {
            acc[acc.length] = outItem;
          }
        } else if (item.type === CatalogItemType.Group) {
          (outItem as CatalogItemGroup).items = recursiveGroupByLayerAddress(
            (item as CatalogItemGroup).items ?? [],
            (layer) => layer.title
          );
          acc[acc.length] = outItem;
        }

        return acc;
      }, []);

    const request4$ = request3$.pipe(
      map((output) => groupByGroupId(output, (group) => group.id)),
      map((output) => output.flat()),
      map((data) => recursiveGroupByLayerAddress(data, (layer) => layer.title))
    );

    return request4$;
  }

  private getCatalogCapabilities(catalog: Catalog): Observable<unknown> {
    return this.capabilitiesService
      .getCapabilities(
        catalog.type as TypeCapabilitiesStrings,
        catalog.url,
        catalog.version
      )
      .pipe(
        catchError((e) => {
          this.showError(catalog);
          console.error(e);
          return of(undefined);
        })
      );
  }

  /// WMS
  private prepareCatalogItemLayer(
    layer: WmsCapabilityLayer,
    idParent: string,
    layersQueryFormat: { layer: string; queryFormat: QueryFormat }[],
    catalog: Catalog
  ) {
    const configuredQueryFormat = this.retrieveLayerInfoFormat(
      layer.Name ?? '',
      layersQueryFormat
    );

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
      url: removeQueryParameters(catalog.url, [...GetCapabilitiesParams]),
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

    const propertiesToForce = computeForcedProperties(
      layer.Name ?? '',
      catalog.forcedProperties ?? []
    );
    let baseAbstract: string | undefined;
    let extern = true;
    if (layer.Abstract) {
      baseAbstract = layer.Abstract;
    } else if (!layer.Abstract && catalog.abstract) {
      baseAbstract = catalog.abstract;
    }
    const layerOnlineResource =
      layer?.DataURL && layer?.DataURL.length > 0
        ? layer?.DataURL[0].OnlineResource
        : undefined;

    const metadataUrl =
      propertiesToForce?.metadataUrl ||
      propertiesToForce?.metadataUrlAll ||
      layerOnlineResource;
    const metadataAbstract =
      propertiesToForce?.metadataAbstract ||
      propertiesToForce?.metadataAbstractAll ||
      baseAbstract;

    if (
      !propertiesToForce?.metadataUrl &&
      !propertiesToForce?.metadataUrlAll &&
      (propertiesToForce?.metadataAbstract ||
        propertiesToForce?.metadataAbstractAll)
    ) {
      extern = false;
    }
    if (
      propertiesToForce?.metadataAbstract &&
      propertiesToForce?.metadataUrlAll
    ) {
      extern = false;
    }

    const layerPrepare = {
      id: generateIdFromSourceOptions(sourceOptions),
      type: CatalogItemType.Layer,
      title: propertiesToForce?.title ? propertiesToForce.title : layer.Title,
      address: idParent,
      externalProvider: catalog.externalProvider || false,
      options: {
        maxResolution:
          layer.MaxScaleDenominator !== undefined
            ? getResolutionFromScale(layer.MaxScaleDenominator)
            : undefined,
        minResolution:
          layer.MinScaleDenominator !== undefined
            ? getResolutionFromScale(layer.MinScaleDenominator)
            : undefined,
        metadata: {
          url: metadataUrl,
          extern,
          abstract: metadataAbstract,
          type: baseSourceOptions.type
        },
        legendOptions,
        tooltip: { type: catalog.tooltipType },
        sourceOptions
      }
    } as CatalogItem;

    return ObjectUtils.removeUndefined(layerPrepare);
  }

  private prepareCatalogItemGroup(
    itemListIn: WmsCapabilityLayer,
    regexes: RegExp[],
    idGroup: string,
    layersQueryFormat: { layer: string; queryFormat: QueryFormat }[],
    catalog: Catalog
  ) {
    const groupPrepare = {
      id: idGroup,
      type: CatalogItemType.Group,
      title: itemListIn.Title,
      address: catalog.id,
      externalProvider: catalog.externalProvider || false,
      sortDirection: catalog.sortDirection, // propagate sortDirection
      items: (itemListIn.Layer ?? []).reduce(
        (items: CatalogItem[], layer: WmsCapabilityLayer) => {
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
            if (testLayerRegexes(layer.Name ?? '', regexes) === false) {
              return items;
            }

            const layerItem = this.prepareCatalogItemLayer(
              layer,
              idGroup,
              layersQueryFormat,
              catalog
            ) as CatalogItemLayer<ImageLayerOptions>;

            items.push(layerItem);
          }
          return items;
        },
        []
      )
    };
    return groupPrepare;
  }

  private includeRecursiveItems(
    catalog: Catalog,
    itemListIn: any,
    itemsPrepare: CatalogItem[],
    loopLevel = 0
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
        if (testLayerRegexes(item.Name ?? '', regexes) !== false) {
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

  /// WMTS
  private getWMTSItems(
    catalog: Catalog,
    capabilities: WmtsCapabilities
  ): CatalogItemLayer[] {
    if (!capabilities) {
      return [];
    }
    const layers = capabilities.Contents.Layer;
    const regexes = (catalog.regFilters || []).map(
      (pattern: string) => new RegExp(pattern)
    );

    if (capabilities.ServiceIdentification?.Abstract?.length) {
      catalog.abstract = capabilities.ServiceIdentification.Abstract;
    }

    return layers
      .map((layer: WmtsCapabilityLayer) => {
        const propertiesToForce = computeForcedProperties(
          layer.Title ?? layer.Identifier,
          catalog.forcedProperties ?? []
        );
        let extern = true;

        const metadataUrl =
          propertiesToForce?.metadataUrl || propertiesToForce?.metadataUrlAll;
        const metadataAbstract =
          propertiesToForce?.metadataAbstract ||
          propertiesToForce?.metadataAbstractAll ||
          catalog.abstract;

        if (
          !propertiesToForce?.metadataUrl &&
          !propertiesToForce?.metadataUrlAll &&
          (propertiesToForce?.metadataAbstract ||
            propertiesToForce?.metadataAbstractAll)
        ) {
          extern = false;
        }
        if (
          propertiesToForce?.metadataAbstract &&
          propertiesToForce?.metadataUrlAll
        ) {
          extern = false;
        }

        if (testLayerRegexes(layer.Identifier, regexes) === false) {
          return undefined;
        }
        const params = Object.assign({}, catalog.queryParams, {
          version: '1.0.0'
        });
        const baseSourceOptions = {
          type: 'wmts',
          url: removeQueryParameters(catalog.url, [...GetCapabilitiesParams]),
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
          title: propertiesToForce?.title
            ? propertiesToForce.title
            : layer.Title,
          address: catalog.id,
          externalProvider: catalog.externalProvider,
          options: {
            sourceOptions,
            metadata: {
              url: metadataUrl,
              extern,
              abstract: metadataAbstract,
              type: baseSourceOptions.type
            }
          }
        } as CatalogItem);
      })
      .filter((item): item is CatalogItemLayer => item !== undefined);
  }

  private retrieveLayerInfoFormat(
    layerNameFromCatalog: string,
    layersQueryFormat: { layer: string; queryFormat: QueryFormat }[]
  ): QueryFormat | undefined {
    const currentLayerInfoFormat = layersQueryFormat.find(
      (f) => f.layer === layerNameFromCatalog
    );
    const baseInfoFormat = layersQueryFormat.find((f) => f.layer === '*');
    let queryFormat: QueryFormat | undefined;
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
    const queryFormatConfig =
      catalog.queryFormat as unknown as CatalogQueryFormatTypes;
    const queryFormatKeys = Object.keys(queryFormatConfig) as QueryFormat[];
    queryFormatKeys.forEach((configuredInfoFormat) => {
      if (queryFormatConfig[configuredInfoFormat] instanceof Array) {
        queryFormatConfig[configuredInfoFormat].forEach((layerName) => {
          if (
            !layersQueryFormat.find((specific) => specific.layer === layerName)
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
            (specific) =>
              specific.layer === queryFormatConfig[configuredInfoFormat]
          )
        ) {
          layersQueryFormat.push({
            layer: queryFormatConfig[configuredInfoFormat] as string,
            queryFormat: configuredInfoFormat as QueryFormat
          });
        }
      }
    });
    return layersQueryFormat;
  }
}

class CatalogFactory {
  public static createInstanceCatalog(
    options: ICatalog,
    catalogService: CatalogService
  ): Catalog {
    let catalog: Catalog;
    // eslint-disable-next-line no-prototype-builtins
    if (options.hasOwnProperty('composite')) {
      catalog = new CompositeCatalog(
        options as unknown as ICompositeCatalog,
        (catalog: Catalog) =>
          catalogService.loadCatalogCompositeLayerItems(catalog)
      );
    } else if (options.type === TypeCatalog[TypeCatalog.baselayers]) {
      catalog = new BaselayersCatalog(options, (catalog: Catalog) =>
        catalogService.loadCatalogBaseLayerItems(catalog)
      );
    } else if (options.type === TypeCatalog[TypeCatalog.arcgisrest]) {
      catalog = new ArcGISRestCatalog(options, (catalog: Catalog) =>
        catalogService.loadCatalogArcGISRestItems(catalog)
      );
    } else if (options.type === TypeCatalog[TypeCatalog.tilearcgisrest]) {
      catalog = new TileOrImageArcGISRestCatalog(
        options,
        (catalog: Catalog) =>
          catalogService.loadCatalogArcGISRestItems(catalog),
        TypeCatalog.tilearcgisrest
      );
    } else if (options.type === TypeCatalog[TypeCatalog.imagearcgisrest]) {
      catalog = new TileOrImageArcGISRestCatalog(
        options,
        (catalog: Catalog) =>
          catalogService.loadCatalogArcGISRestItems(catalog),
        TypeCatalog.imagearcgisrest
      );
    } else if (options.type === TypeCatalog[TypeCatalog.wmts]) {
      catalog = new WMTSCatalog(options, (catalog: Catalog) =>
        catalogService.loadCatalogWMTSLayerItems(catalog)
      );
    } else {
      catalog = new WMSCatalog(options, (catalog: Catalog) =>
        catalogService.loadCatalogWMSLayerItems(catalog)
      );
    }

    return catalog;
  }
}
