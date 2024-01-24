import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ConfigService, LanguageService, MessageService } from '@igo2/core';
import { ObjectUtils, uuid } from '@igo2/utils';

import { EMPTY, Observable, of, zip } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Md5 } from 'ts-md5';

import {
  ArcGISRestCapabilitiesLayer,
  ArcGISRestCapabilitiesLayerTypes
} from '../../datasource/shared/capabilities.interface';
import { CapabilitiesService } from '../../datasource/shared/capabilities.service';
import {
  ArcGISRestDataSourceOptions,
  WMSDataSourceOptions,
  WMSDataSourceOptionsParams,
  WMTSDataSourceOptions
} from '../../datasource/shared/datasources';
import { ImageLayerOptions, LayerOptions } from '../../layer/shared';
import { getResolutionFromScale } from '../../map/shared/map.utils';
import { QueryFormat } from '../../query/shared/query.enums';
import { QueryableDataSourceOptions } from '../../query/shared/query.interfaces';
import { generateIdFromSourceOptions } from '../../utils/id-generator';
import { Catalog } from './catalog.abstract';
import { CatalogItemType, TypeCatalog } from './catalog.enum';
import {
  CatalogItem,
  CatalogItemGroup,
  CatalogItemLayer,
  CatalogServiceOptions,
  ForcedProperty
} from './catalog.interface';
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
  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private languageService: LanguageService,
    private messageService: MessageService,
    private capabilitiesService: CapabilitiesService
  ) {}

  loadCatalogs(): Observable<Catalog[]> {
    const contextConfig = this.config.getConfig('context') || {};

    const catalogConfig: CatalogServiceOptions =
      this.config.getConfig('catalog') || {};
    const apiUrl = catalogConfig.url || contextConfig.url;
    const catalogsFromConfig = catalogConfig.sources || [];

    const observables$ = [];

    if (apiUrl) {
      if (catalogConfig.baselayers) {
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
          map((catalogs) =>
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
        const finalLayers = [];
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
          (f) => f.Layer.length !== 0
        );
        this.includeRecursiveItems(catalog, capabilitiesCapabilityLayer, items);
        return items;
      })
    );
  }

  flattenWmsCapabilities(parent, level = 0, finalLayers, separator = ' / ') {
    if (!finalLayers.includes(parent.Title)) {
      const modifiedParent = Object.assign({}, parent);
      modifiedParent.Layer = [];
      finalLayers.push(modifiedParent);
    }
    for (const layer of parent.Layer) {
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
        finalLayers.find((ff) => ff.Title === parent.Title).Layer.push(layer);
      }
    }
  }

  loadCatalogWMTSLayerItems(catalog: Catalog): Observable<CatalogItem[]> {
    return this.getCatalogCapabilities(catalog).pipe(
      map((capabilities: any) => this.getWMTSItems(catalog, capabilities))
    );
  }

  loadCatalogArcGISRestItems(catalog: Catalog): Observable<CatalogItem[]> {
    return this.getCatalogCapabilities(catalog).pipe(
      map((capabilities: any) => {
        return this.getArcGISRESTItems(catalog, capabilities);
      })
    );
  }

  loadCatalogCompositeLayerItems(catalog: Catalog): Observable<CatalogItem[]> {
    const compositeCatalog = (catalog as CompositeCatalog).composite;

    const catalogsFromInstance = [] as Catalog[];
    compositeCatalog.map((component: Catalog) => {
      component.sortDirection = catalog.sortDirection; // propagate sortDirection with parent value
      catalogsFromInstance.push(
        CatalogFactory.createInstanceCatalog(component, this)
      );
    });

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
      Object.keys(compositeCatalog).find((k) => compositeCatalog[k].groupImpose)
    ) {
      const pushImposeGroup = (item, index) => {
        const c = catalogsFromInstance[index];
        const outGroupImpose = Object.assign({}, c.groupImpose);
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
        const ind = acc.find((x) => x.id === groupId);

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
          // same title, same address => result: only one item is kept

          // same title, address diff
          const indicesMatchTitle = [];
          const indicesMatchNewMetadataUrl = []; // metadata
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
            let nPosition = indicesMatchTitle.findIndex((x) => x === idx) + 1;
            outItem.title = `${item.title} (${nPosition})`; // source: ${item.address.split('.')[0]}
            nPosition =
              indicesMatchNewMetadataUrl.findIndex((x) => x === idx) + 1;
            outItem.newMetadataUrl = `${item.newMetadataUrl} (${nPosition})`; // source: ${item.address.split('.')[0]}
          }

          const exist = acc.find(
            (x) => x.title === outItem.title && x.type === CatalogItemType.Layer
          );
          if (!exist) {
            acc[acc.length] = outItem;
          }
        } else if (item.type === CatalogItemType.Group) {
          outItem.items = recursiveGroupByLayerAddress(
            item.items,
            (layer) => layer.title
          );
          acc[acc.length] = outItem;
        }

        return acc;
      }, []);

    const request4$ = request3$.pipe(
      map((output) => groupByGroupId(output, (group) => group.id)),
      map((output) => [].concat(...output)),
      map((data) => recursiveGroupByLayerAddress(data, (layer) => layer.title))
    );

    return request4$;
  }

  private getCatalogCapabilities(catalog: Catalog): Observable<any> {
    const sType: string = TypeCatalog[catalog.type as string];
    return this.capabilitiesService
      .getCapabilities(sType as any, catalog.url, catalog.version)
      .pipe(
        catchError((e) => {
          this.messageService.error(
            catalog.title
              ? 'igo.geo.catalog.unavailable'
              : 'igo.geo.catalog.someUnavailable',
            'igo.geo.catalog.unavailableTitle',
            undefined,
            catalog.title ? { value: catalog.title } : undefined
          );
          console.error(e);
          return of(undefined);
        })
      );
  }

  private computeForcedProperties(
    layerNameFromCatalog: string,
    forcedProperties: ForcedProperty[]
  ): ForcedProperty {
    if (!forcedProperties || forcedProperties.length === 0) {
      return;
    }
    const returnProperty: ForcedProperty = {
      layerName: layerNameFromCatalog,
      title: undefined,
      metadataUrl: undefined,
      metadataAbstract: undefined,
      metadataAbstractAll: undefined,
      metadataUrlAll: undefined
    };
    //process wildcard before
    // if there is a * wildcard
    const forcedPropertiesForAllLayers = forcedProperties.find(
      (f) => f.layerName === '*'
    );
    if (forcedPropertiesForAllLayers) {
      // metadataAbstractAll
      if (forcedPropertiesForAllLayers.metadataAbstractAll) {
        returnProperty.metadataAbstractAll =
          forcedPropertiesForAllLayers.metadataAbstractAll;
      }
      // metadataUrlAll
      if (forcedPropertiesForAllLayers.metadataUrlAll) {
        returnProperty.metadataUrlAll =
          forcedPropertiesForAllLayers.metadataUrlAll;
      }
    }
    forcedProperties.map((forcedProperty) => {
      // if match found
      if (layerNameFromCatalog === forcedProperty.layerName) {
        // title
        if (forcedProperty.title) {
          returnProperty.title = forcedProperty.title;
        }
        // metadataUrl
        if (forcedProperty.metadataUrl) {
          returnProperty.metadataUrl = forcedProperty.metadataUrl;
        }
        // metadataAbstract
        if (forcedProperty.metadataAbstract) {
          returnProperty.metadataAbstract = forcedProperty.metadataAbstract;
        }
      }
    });
    return returnProperty;
  }

  /// WMS

  private prepareCatalogItemLayer(layer, idParent, layersQueryFormat, catalog) {
    const configuredQueryFormat = this.retrieveLayerInfoFormat(
      layer.Name,
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

    const propertiesToForce = this.computeForcedProperties(
      layer.Name,
      catalog.forcedProperties
    );
    let baseAbstract;
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

    let metadataUrl =
      propertiesToForce?.metadataUrl ||
      propertiesToForce?.metadataUrlAll ||
      layerOnlineResource;
    let metadataAbstract =
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
        maxResolution: getResolutionFromScale(layer.MaxScaleDenominator),
        minResolution: getResolutionFromScale(layer.MinScaleDenominator),
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
      externalProvider: catalog.externalProvider || false,
      sortDirection: catalog.sortDirection, // propagate sortDirection
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

          const layerItem: CatalogItemLayer<ImageLayerOptions> =
            this.prepareCatalogItemLayer(
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

  /// WMTS

  private getWMTSItems(
    catalog,
    capabilities: { [key: string]: any }
  ): CatalogItemLayer[] {
    if (!capabilities) {
      return [];
    }
    const layers = capabilities.Contents.Layer;
    const regexes = (catalog.regFilters || []).map(
      (pattern: string) => new RegExp(pattern)
    );

    if (
      capabilities.ServiceIdentification &&
      capabilities.ServiceIdentification.Abstract &&
      capabilities.ServiceIdentification.Abstract.length
    ) {
      catalog.abstract = capabilities.ServiceIdentification.Abstract;
    }

    return layers
      .map((layer: any) => {
        const propertiesToForce = this.computeForcedProperties(
          layer.Title,
          catalog.forcedProperties
        );
        let extern = true;

        let metadataUrl =
          propertiesToForce?.metadataUrl || propertiesToForce?.metadataUrlAll;
        let metadataAbstract =
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
      .filter((item: CatalogItemLayer | undefined) => item !== undefined);
  }

  private getArcGISRESTItems(
    catalog: Catalog,
    capabilities
  ): CatalogItemLayer[] {
    if (!capabilities || !capabilities.layers) {
      this.messageService.error(
        'igo.geo.catalog.someUnavailable',
        'igo.geo.catalog.unavailableTitle'
      );
      return [];
    }
    const groups: ArcGISRestCapabilitiesLayer[] = !capabilities.layers
      ? []
      : capabilities.layers.filter((layer) => layer.subLayerIds);
    const layers: ArcGISRestCapabilitiesLayer[] = !capabilities.layers
      ? []
      : capabilities.layers.filter(
          (layer) =>
            !layer.type ||
            layer.type === ArcGISRestCapabilitiesLayerTypes.FeatureLayer ||
            layer.type === ArcGISRestCapabilitiesLayerTypes.RasterLayer
        );

    const regexes = (catalog.regFilters || []).map(
      (pattern: string) => new RegExp(pattern)
    );

    let abstract;
    if (
      capabilities.serviceDescription &&
      capabilities.serviceDescription.length
    ) {
      const regex = /(<([^>]+)>)/gi;
      abstract = capabilities.serviceDescription.replace(regex, '');
    }

    const items: CatalogItemLayer[] = layers
      .map((layer: ArcGISRestCapabilitiesLayer) => {
        const propertiesToForce = this.computeForcedProperties(
          layer.name,
          catalog.forcedProperties
        );
        let baseAbstract = catalog.abstract;
        let extern = true;

        let metadataUrl =
          propertiesToForce?.metadataUrl || propertiesToForce?.metadataUrlAll;
        let metadataAbstract =
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

        if (this.testLayerRegexes(layer.id.toString(), regexes) === false) {
          return undefined;
        }
        const baseSourceOptions: ArcGISRestDataSourceOptions &
          QueryableDataSourceOptions = {
          type: TypeCatalog[catalog.type] as any,
          url: catalog.url,
          layer: layer.id.toString(),
          queryable: true,
          queryFormat: QueryFormat.ESRIJSON,
          optionsFromCapabilities: true
        };
        const sourceOptions: ArcGISRestDataSourceOptions = Object.assign(
          {},
          baseSourceOptions,
          catalog.sourceOptions
        );
        return ObjectUtils.removeUndefined({
          id: generateIdFromSourceOptions(sourceOptions),
          type: CatalogItemType.Layer,
          title: propertiesToForce?.title
            ? propertiesToForce.title
            : layer.name,
          externalProvider: catalog.externalProvider,
          address: catalog.id,
          options: {
            sourceOptions,
            minResolution: getResolutionFromScale(layer.maxScale),
            maxResolution: getResolutionFromScale(layer.minScale),
            metadata: {
              url: metadataUrl,
              extern,
              abstract: metadataAbstract,
              type: catalog.type
            }
          }
        } as CatalogItem);
      })
      .filter((item: CatalogItemLayer | undefined) => item !== undefined);

    const groupedItems: CatalogItemLayer[] = groups
      .map((group) => {
        const md5 = Md5.hashStr(group.name);
        return {
          options: undefined,
          address: `catalog.group.${md5}`,
          id: `catalog.group.${md5}`,
          type: CatalogItemType.Group,
          externalProvider: catalog.externalProvider,
          sortDirection: catalog.sortDirection,
          title: group.name,
          items: items
            .filter((i) => {
              const subLayerIdsStr = group.subLayerIds.map((r) => r.toString());
              return subLayerIdsStr.includes(
                (i.options.sourceOptions as ArcGISRestDataSourceOptions).layer
              );
            })
            .map((i) =>
              Object.assign({}, i, {
                address: `catalog.group.${group.name}`
              })
            )
        };
      })
      .filter((g) => g.items.length);

    return groups ? groupedItems : items;
  }

  private testLayerRegexes(layerName: string, regexes: RegExp[]): boolean {
    if (regexes.length === 0) {
      return true;
    }
    return regexes.find((regex: RegExp) => regex.test(layerName)) !== undefined;
  }

  private retrieveLayerInfoFormat(
    layerNameFromCatalog: string,
    layersQueryFormat: { layer: string; queryFormat: QueryFormat }[]
  ): QueryFormat {
    const currentLayerInfoFormat = layersQueryFormat.find(
      (f) => f.layer === layerNameFromCatalog
    );
    const baseInfoFormat = layersQueryFormat.find((f) => f.layer === '*');
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
    Object.keys(catalog.queryFormat).forEach((configuredInfoFormat) => {
      if (catalog.queryFormat[configuredInfoFormat] instanceof Array) {
        catalog.queryFormat[configuredInfoFormat].forEach((layerName) => {
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

class CatalogFactory {
  public static createInstanceCatalog(
    options: Catalog,
    catalogService: CatalogService
  ): Catalog {
    let catalog: Catalog;
    if (options.hasOwnProperty('composite')) {
      catalog = new CompositeCatalog(options, (catalog: Catalog) =>
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
