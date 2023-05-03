import { Injectable } from '@angular/core';
import {
  ActionStore,
  EntityRecord,
  EntityStoreFilterCustomFuncStrategy,
  EntityStoreFilterSelectionStrategy,
  EntityStoreStrategyFuncOptions,
  EntityTableButton,
  EntityTableColumnRenderer,
  EntityTableTemplate } from '@igo2/common';
import { StorageService, ConfigService } from '@igo2/core';
import { skipWhile, take } from 'rxjs/operators';
import { CapabilitiesService, RelationOptions, SourceFieldsOptionsParams, WMSDataSource } from '../../datasource';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { WFSDataSourceOptions } from '../../datasource/shared/datasources/wfs-datasource.interface';
import {
  Feature,
  FeatureMotion,
  FeatureStore,
  FeatureStoreInMapExtentStrategy,
  FeatureStoreInMapResolutionStrategy,
  FeatureStoreLoadingLayerStrategy,
  FeatureStoreSelectionStrategy,
  GeoPropertiesStrategy} from '../../feature';

import { OgcFilterableDataSourceOptions } from '../../filter/shared/ogc-filter.interface';
import { ImageLayer, LayerService, LayersLinkProperties, LinkedProperties, VectorLayer } from '../../layer';
import { StyleService } from '../../style/style-service/style.service';
import { GeoWorkspaceOptions } from '../../layer/shared/layers/layer.interface';
import { IgoMap } from '../../map';
import { QueryableDataSourceOptions } from '../../query/shared/query.interfaces';
import { WfsWorkspace } from './wfs-workspace';
import { getCommonVectorSelectedStyle } from '../../style/shared/vector/commonVectorStyle';

import olFeature from 'ol/Feature';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import { PropertyTypeDetectorService } from '../../utils/propertyTypeDetector/propertyTypeDetector.service';
import { ObjectUtils } from '@igo2/utils';
import { generateIdFromSourceOptions } from '../../utils/id-generator';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class WmsWorkspaceService {

  get zoomAuto(): boolean {
    return this.storageService.get('zoomAuto') as boolean;
  }

  public ws$ = new BehaviorSubject<string>(undefined);

  constructor(
    private layerService: LayerService,
    private storageService: StorageService,
    private capabilitiesService: CapabilitiesService,
    private styleService: StyleService,
    private configService: ConfigService,
    private propertyTypeDetectorService: PropertyTypeDetectorService) { }

  createWorkspace(layer: ImageLayer, map: IgoMap): WfsWorkspace {
    if (
      !layer.options.workspace ||
      map.layers.find(lay => lay.id === layer.id + '.WfsWorkspaceTableDest') ||
      layer.dataSource.options.edition) {
      return;
    }
    const dataSource: WMSDataSource = layer.dataSource as WMSDataSource ;
    const wmsLinkId = layer.id + '.WmsWorkspaceTableSrc';
    const wfsLinkId = layer.id + '.WfsWorkspaceTableDest';
    if (!layer.options.linkedLayers) {
      layer.options.linkedLayers = { linkId: wmsLinkId, links: [] };
    }
    const linkProperties = {
      syncedDelete: true,
      linkedIds: [wfsLinkId],
      properties: [
        LinkedProperties.ZINDEX,
        LinkedProperties.VISIBLE]
    } as LayersLinkProperties;

    if (!layer.options.workspace?.minResolution) {
       linkProperties.properties.push(LinkedProperties.MINRESOLUTION);
    }
    let hasOgcFilters = false;
    if ((dataSource.options as OgcFilterableDataSourceOptions).ogcFilters?.enabled) {
      linkProperties.properties.push(LinkedProperties.OGCFILTERS);
      hasOgcFilters = true;
    }
    if (!layer.options.workspace?.maxResolution) {
      linkProperties.properties.push(LinkedProperties.MAXRESOLUTION);
    }

    let clonedLinks: LayersLinkProperties[] = [];
    if (layer.options.linkedLayers.links) {
      clonedLinks = JSON.parse(JSON.stringify(layer.options.linkedLayers.links));
    }
    clonedLinks.push(linkProperties);

    layer.options.linkedLayers.linkId = layer.options.linkedLayers.linkId ? layer.options.linkedLayers.linkId : wmsLinkId,
      layer.options.linkedLayers.links = clonedLinks;
    interface WFSoptions extends WFSDataSourceOptions, OgcFilterableDataSourceOptions { }

    let wks;
    let wksLayerOption = {
      srcId: layer.id,
      workspaceId: undefined,
      enabled: false,
      queryOptions: {
        mapQueryOnOpenTab: layer.options.workspace?.queryOptions?.mapQueryOnOpenTab,
        tabQuery: layer.options.workspace?.queryOptions?.tabQuery
      },
      pageSize: layer.options.workspace?.pageSize,
      pageSizeOptions: layer.options.workspace?.pageSizeOptions
    };

    this.layerService
      .createAsyncLayer({
        isIgoInternalLayer: true,
        id: wfsLinkId,
        linkedLayers: {
          linkId: wfsLinkId
        },
        workspace: wksLayerOption,
        showInLayerList: false,
        opacity: 0,
        title: layer.title,
        minResolution: layer.options.workspace?.minResolution || layer.minResolution || 0,
        maxResolution: layer.options.workspace?.maxResolution || layer.maxResolution || Infinity,
        style: this.styleService.createStyle(
          {
            fill: {
              "color": "rgba(255, 255, 255, 0.01)"
            },
            stroke: {
              "color": "rgba(255, 255, 255, 0.01)"
            },
            circle: {
              fill: {
                color: "rgba(255, 255, 255, 0.01)"
              },
              stroke: {
                color: "rgba(255, 255, 255, 0.01)"
              },
              radius: 5
            }
          }),
        sourceOptions: {
          download: dataSource.options.download,
          type: 'wfs',
          url: dataSource.options.urlWfs || dataSource.options.url,
          queryable: true,
          relations: dataSource.options.relations,
          queryTitle: (dataSource.options as QueryableDataSourceOptions).queryTitle,
          queryFormatAsWms: layer.options.workspace?.enabled ? (dataSource.options as QueryableDataSourceOptions).queryFormatAsWms : true,
          params: dataSource.options.paramsWFS,
          ogcFilters: Object.assign({}, dataSource.ogcFilters, {enabled: hasOgcFilters}),
          sourceFields: dataSource.options.sourceFields || undefined
        } as WFSoptions
      })
      .subscribe((workspaceLayer: VectorLayer) => {
        map.addLayer(workspaceLayer);
        layer.ol.setProperties({ linkedLayers: { linkId: layer.options.linkedLayers.linkId, links: clonedLinks } }, false);
        workspaceLayer.dataSource.ol.refresh();

        if (!layer.options.workspace?.enabled) {
          return;
        }
        wks = new WfsWorkspace({
          id: layer.id,
          title: layer.title,
          layer: workspaceLayer,
          map,
          entityStore: this.createFeatureStore(workspaceLayer, map),
          actionStore: new ActionStore([]),
          meta: {
            tableTemplate: undefined
          }
        });
        this.createTableTemplate(wks, workspaceLayer);

        workspaceLayer.options.workspace.workspaceId = workspaceLayer.id;
        layer.options.workspace = Object.assign({}, layer.options.workspace,
          {
            enabled: true,
            srcId: layer.id,
            workspaceId: workspaceLayer.id,
            queryOptions: {
              mapQueryOnOpenTab: layer.options.workspace?.queryOptions?.mapQueryOnOpenTab,
              tabQuery: layer.options.workspace?.queryOptions?.tabQuery
            },
            pageSize: layer.options.workspace?.pageSize,
            pageSizeOptions: layer.options.workspace?.pageSizeOptions
          } as GeoWorkspaceOptions);

        delete dataSource.options.download;
        return wks;

      });

    return wks;
  }

  private createFeatureStore(layer: VectorLayer, map: IgoMap): FeatureStore {
    const store = new FeatureStore([], { map });
    store.bindLayer(layer);

    const loadingStrategy = new FeatureStoreLoadingLayerStrategy({});
    const inMapExtentStrategy = new FeatureStoreInMapExtentStrategy({});
    const geoPropertiesStrategy = new GeoPropertiesStrategy({ map }, this.propertyTypeDetectorService, this.capabilitiesService);
    const inMapResolutionStrategy = new FeatureStoreInMapResolutionStrategy({});
    const selectedRecordStrategy = new EntityStoreFilterSelectionStrategy({});
    const confQueryOverlayStyle= this.configService.getConfig('queryOverlayStyle');

    const selectionStrategy = new FeatureStoreSelectionStrategy({
      layer: new VectorLayer({
        zIndex: 300,
        source: new FeatureDataSource(),
        style: (feature) => {
          return getCommonVectorSelectedStyle(Object.assign({}, {feature}, confQueryOverlayStyle.selection || {}));
        },
        showInLayerList: false,
        exportable: false,
        browsable: false
      }),
      map,
      hitTolerance: 15,
      motion: this.zoomAuto ? FeatureMotion.Default : FeatureMotion.None,
      many: true,
      dragBox: true
    });
    store.addStrategy(loadingStrategy, true);
    store.addStrategy(inMapExtentStrategy, true);
    store.addStrategy(geoPropertiesStrategy, true);
    store.addStrategy(inMapResolutionStrategy, true);
    store.addStrategy(selectionStrategy, true);
    store.addStrategy(selectedRecordStrategy, false);
    store.addStrategy(this.createFilterInMapExtentOrResolutionStrategy(), true);
    return store;
  }

  addLayer(map: IgoMap, url, type, layerName) {
    const so = ObjectUtils.removeUndefined({
      sourceOptions: {
        type: type ,
        url,
        optionsFromCapabilities: true,
        optionsFromApi: true,
        params: {
          LAYERS: layerName,
          LAYER: layerName
        }
      }
    });
    this.layerService
    .createAsyncLayer(so)
    .subscribe(l => map.addLayer(l));
  }

  removeLayer(map: IgoMap, url, type, layerName) {
    const so = ObjectUtils.removeUndefined({
      sourceOptions: {
        type: type ,
        url,
        optionsFromCapabilities: true,
        optionsFromApi: true,
        params: {
          LAYERS: layerName,
          LAYER: layerName
        }
      }
    });
    const addedLayerId = generateIdFromSourceOptions(so.sourceOptions);
    map.removeLayer(map.layers.find(l => l.id === addedLayerId));

  }


  private createTableTemplate(workspace: WfsWorkspace, layer: VectorLayer): EntityTableTemplate {
    const geoServiceAction = [{
      name: 'geoServiceAction',
      title: undefined,
      tooltip: '',
      renderer: EntityTableColumnRenderer.ButtonGroup,
      valueAccessor: (entity: Feature, record: EntityRecord<Feature>) => {
        let geoServiceProperties = record.state.geoService;
        if (
          geoServiceProperties &&
          geoServiceProperties.haveGeoServiceProperties &&
          geoServiceProperties.url &&
          geoServiceProperties.layerName
        ) {
          if (geoServiceProperties.added) {
            return [{
              icon: 'delete',
              color: 'warn',
              click: (row, record) => {
                this.removeLayer(workspace.map, record.state.geoService.url,
                  record.state.geoService.type, record.state.geoService.layerName);
                geoServiceProperties.added = false;
              }
            }] as EntityTableButton[];
          } else {
            return [{
              icon: 'plus',
              color: 'primary',
              click: (row, record) => {
                this.addLayer(workspace.map, record.state.geoService.url, record.state.geoService.type, record.state.geoService.layerName);
                geoServiceProperties.added = true;
              }
            }] as EntityTableButton[];
          }
        } else {
          return [];
        }
      },
    }];
    const fields = layer.dataSource.options.sourceFields || [];

    const relations = layer.dataSource.options.relations || [];

    if (fields.length === 0) {
      workspace.entityStore.entities$.pipe(
        skipWhile(val => val.length === 0),
        take(1)
      ).subscribe(entities => {
        const ol = (entities[0] as Feature).ol as olFeature<OlGeometry>;
        const columnsFromFeatures = ol.getKeys()
          .filter(
            col => !col.startsWith('_') &&
              col !== 'geometry' &&
              col !== ol.getGeometryName() &&
              !col.match(/boundedby/gi))
          .map(key => {
            return {
              name: `properties.${key}`,
              title: key,
              renderer: EntityTableColumnRenderer.UnsanitizedHTML
            };
          });
        columnsFromFeatures.unshift(...geoServiceAction);
        workspace.meta.tableTemplate = {
          selection: true,
          sort: true,
          columns: columnsFromFeatures
        };
      });
      return;
    }
    const columns = fields.map((field: SourceFieldsOptionsParams) => {
      return {
        name: `properties.${field.name}`,
        title: field.alias ? field.alias : field.name,
        renderer: EntityTableColumnRenderer.UnsanitizedHTML,
        tooltip: field.tooltip
      };
    });

    const relationsColumn = relations.map((relation: RelationOptions) => {
      return {
        name: `properties.${relation.name}`,
        title: relation.alias ? relation.alias : relation.name,
        renderer: EntityTableColumnRenderer.Icon,
        icon: relation.icon,
        parent: relation.parent,
        type: 'relation',
        tooltip: relation.tooltip,
        onClick: () => {
            this.ws$.next(relation.title);
        },
        cellClassFunc: () => {
          return { 'class_icon': true };
        }
      };
    });

    columns.push(...relationsColumn);
    columns.unshift(...geoServiceAction);
    workspace.meta.tableTemplate = {
      selection: true,
      sort: true,
      columns
    };
  }

  private createFilterInMapExtentOrResolutionStrategy(): EntityStoreFilterCustomFuncStrategy {
    const filterClauseFunc = (record: EntityRecord<object>) => {
      return record.state.inMapExtent === true && record.state.inMapResolution === true;
    };
    return new EntityStoreFilterCustomFuncStrategy({filterClauseFunc} as EntityStoreStrategyFuncOptions);
  }
}
