import { Injectable } from '@angular/core';
import { ActionStore, EntityRecord, EntityStoreFilterCustomFuncStrategy, EntityStoreFilterSelectionStrategy, EntityStoreStrategyFuncOptions, EntityTableTemplate } from '@igo2/common';
import { StorageScope, StorageService } from '@igo2/core';
import { skipWhile, take } from 'rxjs/operators';
import { SourceFieldsOptionsParams } from '../../datasource';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { WFSDataSourceOptions } from '../../datasource/shared/datasources/wfs-datasource.interface';
import { Feature, FeatureMotion, FeatureStore, FeatureStoreInMapExtentStrategy, FeatureStoreInMapResolutionStrategy, FeatureStoreLoadingLayerStrategy, FeatureStoreSelectionStrategy } from '../../feature';

import { OgcFilterableDataSourceOptions } from '../../filter/shared/ogc-filter.interface';
import { ImageLayer, LayerService, LayersLinkProperties, LinkedProperties, VectorLayer } from '../../layer';
import { IgoMap } from '../../map';
import { QueryableDataSourceOptions } from '../../query/shared/query.interfaces';
import { WfsWorkspace } from './wfs-workspace';

@Injectable({
  providedIn: 'root'
})
export class WmsWorkspaceService {

  get zoomAuto(): boolean {
    return this.storageService.get('zoomAuto') as boolean;
  }

  constructor(private layerService: LayerService, private storageService: StorageService) { }

  createWorkspace(layer: ImageLayer, map: IgoMap): WfsWorkspace {
    if (layer.options.workspace?.enabled === false) {
      return;
    }
    const wmsLinkId = layer.id + '.WmsWorkspaceTableSrc';
    const wfsLinkId = layer.id + '.WfsWorkspaceTableDest';
    if (!layer.options.linkedLayers) {
      layer.options.linkedLayers = { linkId: wmsLinkId, links: [] };
    }
    const linkProperties = {
      bidirectionnal: true,
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
    if ((layer.dataSource.options as OgcFilterableDataSourceOptions).ogcFilters?.enabled) {
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
    this.layerService
      .createAsyncLayer({
        linkedLayers: {
          linkId: wfsLinkId
        },
        workspace: {
          enabled: false,
        },
        showInLayerList: false,
        opacity: 0,
        title: layer.title,
        minResolution: layer.options.workspace?.minResolution || layer.minResolution || 0,
        maxResolution: layer.options.workspace?.maxResolution || layer.maxResolution || Infinity,
        sourceOptions: {
          type: 'wfs',
          url: layer.options.sourceOptions.urlWfs || layer.options.sourceOptions.url,
          queryable: true,
          queryTitle: (layer.dataSource.options as QueryableDataSourceOptions).queryTitle,
          params: layer.options.sourceOptions.paramsWFS,
          ogcFilters: Object.assign({}, layer.dataSource.ogcFilters$.value, {enabled: hasOgcFilters}),
          sourceFields: layer.options.sourceOptions.sourceFields || undefined
        } as WFSoptions
      })
      .subscribe((workspaceLayer: VectorLayer) => {
        map.addLayer(workspaceLayer);
        layer.ol.setProperties({ linkedLayers: { linkId: layer.options.linkedLayers.linkId, links: clonedLinks } }, false);
        workspaceLayer.dataSource.ol.refresh();

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

        layer.options.workspace = Object.assign({}, layer.options.workspace, {enabled: true});
        return wks;

      });

    return wks;
  }

  private createFeatureStore(layer: VectorLayer, map: IgoMap): FeatureStore {
    const store = new FeatureStore([], { map });
    store.bindLayer(layer);

    const loadingStrategy = new FeatureStoreLoadingLayerStrategy({});
    const inMapExtentStrategy = new FeatureStoreInMapExtentStrategy({});
    const inMapResolutionStrategy = new FeatureStoreInMapResolutionStrategy({});
    const selectedRecordStrategy = new EntityStoreFilterSelectionStrategy({});
    const selectionStrategy = new FeatureStoreSelectionStrategy({
      layer: new VectorLayer({
        zIndex: 300,
        source: new FeatureDataSource(),
        style: undefined,
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
    this.storageService.set('rowsInMapExtent', true, StorageScope.SESSION);
    store.addStrategy(loadingStrategy, true);
    store.addStrategy(inMapExtentStrategy, true);
    store.addStrategy(inMapResolutionStrategy, true);
    store.addStrategy(selectionStrategy, true);
    store.addStrategy(selectedRecordStrategy, false);
    store.addStrategy(this.createFilterInMapExtentOrResolutionStrategy(), true);
    return store;
  }

  private createTableTemplate(workspace: WfsWorkspace, layer: VectorLayer): EntityTableTemplate {
    const fields = layer.dataSource.options.sourceFields || [];

    if (fields.length === 0) {
      workspace.entityStore.entities$.pipe(
        skipWhile(val => val.length === 0),
        take(1)
      ).subscribe(entities => {
        const columnsFromFeatures = (entities[0] as Feature).ol.getKeys()
          .filter(
            col => !col.startsWith('_') &&
              col !== 'geometry' &&
              col !== (entities[0] as Feature).ol.getGeometryName() &&
              !col.match(/boundedby/gi))
          .map(key => {
            return {
              name: `properties.${key}`,
              title: key
            };
          });
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
        title: field.alias ? field.alias : field.name
      };
    });
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
