import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';

import {
  ActionStore,
  EntityRecord,
  EntityStoreFilterCustomFuncStrategy,
  EntityStoreFilterSelectionStrategy,
  EntityStoreStrategyFuncOptions,
  EntityTableColumnRenderer,
  EntityTableTemplate,
  EntityTableButton} from '@igo2/common';
import { ConfigService, LanguageService, MessageService, StorageService } from '@igo2/core';
import { skipWhile, take } from 'rxjs/operators';
import { RelationOptions, SourceFieldsOptionsParams, WMSDataSource } from '../../datasource';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { WFSDataSourceOptions } from '../../datasource/shared/datasources/wfs-datasource.interface';
import { Feature, FeatureMotion, FeatureStore, FeatureStoreInMapExtentStrategy, FeatureStoreInMapResolutionStrategy, FeatureStoreLoadingLayerStrategy, FeatureStoreSelectionStrategy } from '../../feature';

import { OgcFilterableDataSourceOptions } from '../../filter/shared/ogc-filter.interface';
import { ImageLayer, LayerService, LayersLinkProperties, LinkedProperties, VectorLayer } from '../../layer';
import { GeoWorkspaceOptions } from '../../layer/shared/layers/layer.interface';
import { IgoMap } from '../../map';
import { QueryableDataSourceOptions } from '../../query/shared/query.interfaces';
import { EditionWorkspace } from './edition-workspace';

import olFeature from 'ol/Feature';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import { WorkspaceSelectorDirective } from '../workspace-selector/workspace-selector.directive';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditionWorkspaceService {

  public ws$ = new BehaviorSubject<string>(undefined);

  get zoomAuto(): boolean {
    return this.storageService.get('zoomAuto') as boolean;
  }

  constructor(
    private layerService: LayerService,
    private storageService: StorageService,
    private configService: ConfigService,
    private messageService: MessageService,
    private languageService: LanguageService,
    private http: HttpClient,
    private dialog: MatDialog) { }

  createWorkspace(layer: ImageLayer, map: IgoMap): EditionWorkspace {
    if (layer.options.workspace?.enabled !== true || layer.dataSource.options.edition.enabled !== true) {
      return;
    }
    const dataSource: WMSDataSource = layer.dataSource as WMSDataSource ;
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
    this.layerService
      .createAsyncLayer({
        id: wfsLinkId,
        linkedLayers: {
          linkId: wfsLinkId
        },
        workspace: {
          srcId: layer.id,
          workspaceId: undefined,
          enabled: false,
        },
        showInLayerList: false,
        opacity: 0,
        title: layer.title,
        minResolution: layer.options.workspace?.minResolution || layer.minResolution || 0,
        maxResolution: layer.options.workspace?.maxResolution || layer.maxResolution || Infinity,
        sourceOptions: {
          download: dataSource.options.download,
          type: 'wfs',
          url: dataSource.options.urlWfs || dataSource.options.url,
          queryable: true,
          relations: dataSource.options.relations,
          queryTitle: (dataSource.options as QueryableDataSourceOptions).queryTitle,
          params: dataSource.options.paramsWFS,
          ogcFilters: Object.assign({}, dataSource.ogcFilters$.value, {enabled: hasOgcFilters}),
          sourceFields: dataSource.options.sourceFields || undefined,
          edition: dataSource.options.edition
        } as WFSoptions
      })
      .subscribe((workspaceLayer: VectorLayer) => {
        map.addLayer(workspaceLayer);
        layer.ol.setProperties({ linkedLayers: { linkId: layer.options.linkedLayers.linkId, links: clonedLinks } }, false);
        workspaceLayer.dataSource.ol.refresh();

        wks = new EditionWorkspace({
          id: layer.id,
          title: layer.title,
          layer: workspaceLayer,
          map,
          entityStore: this.createFeatureStore(workspaceLayer, map),
          actionStore: new ActionStore([]),
          meta: {
            tableTemplate: undefined
          }
        }, this, this.dialog, this.configService);
        this.createTableTemplate(wks, workspaceLayer);

        workspaceLayer.options.workspace.workspaceId = workspaceLayer.id;
        layer.options.workspace = Object.assign({}, layer.options.workspace,
          {
            enabled: true,
            srcId: layer.id,
            workspaceId: workspaceLayer.id
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
    store.addStrategy(loadingStrategy, true);
    store.addStrategy(inMapExtentStrategy, true);
    store.addStrategy(inMapResolutionStrategy, true);
    store.addStrategy(selectionStrategy, true);
    store.addStrategy(selectedRecordStrategy, false);
    store.addStrategy(this.createFilterInMapExtentOrResolutionStrategy(), true);
    return store;
  }

  private createTableTemplate(workspace: EditionWorkspace, layer: VectorLayer): EntityTableTemplate {
    let directive: WorkspaceSelectorDirective;
    const fields = layer.dataSource.options.sourceFields || [];

    const relations = layer.dataSource.options.relations || [];

    let rendererType = EntityTableColumnRenderer.UnsanitizedHTML;
    let buttons = [];
    let columns = [];
    let relationsColumn = [];

    buttons = [{
      name: 'edition',
      title: undefined,
      renderer: EntityTableColumnRenderer.ButtonGroup,
      primary: false,
      valueAccessor: (entity: object) => {
        return [{
          icon: 'pencil',
          color: 'primary',
          click: (feature) => { workspace.modifyFeature(feature, workspace) }
        },
        {
          icon: 'delete',
          color: 'warn',
          click: (feature) => { workspace.deleteFeature(feature, workspace) }
        }] as EntityTableButton[];
      }
    }];


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
              renderer: rendererType,
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

    columns = fields.map((field: SourceFieldsOptionsParams) => {
      return {
        name: `properties.${field.name}`,
        title: field.alias ? field.alias : field.name,
        renderer: rendererType,
        valueAccessor: undefined,
        primary: field.primary === true ? true : false,
        visible: field.visible,
        validation: field.validation,
        valueReturn: field.valueReturn,
        type: field.type
      };
    });

    relationsColumn = relations.map((relation: RelationOptions) => {
      return {
        name: `properties.${relation.name}`,
        title: relation.alias ? relation.alias : relation.name,
        renderer: EntityTableColumnRenderer.Icon,
        icon: relation.icon,
        parent: relation.parent,
        type: 'relation',
        onClick: () => { this.ws$.next(relation.title)}
      };
    });

    columns.push(...relationsColumn);
    columns.push(...buttons);
   
    console.log(columns);
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

  public modifyTableTemplate(workspace: EditionWorkspace, layer, feature, url, add?: boolean) {
    const fields = layer.dataSource.options.sourceFields || [];
    let rendereType = EntityTableColumnRenderer.Editable;
    let buttons = [];
    let columns = [];

    buttons = [{
      name: 'edition',
      title: undefined,
      renderer: EntityTableColumnRenderer.ButtonGroup,
      primary: false,
      valueAccessor: () => {
        return [{
          icon: 'check',
          color: 'primary',
          click: (feature) => { add ? this.addFeature(url, feature) : this.modifyFeature(feature, workspace, url) }
        },
        {
          icon: 'alpha-x',
          color: 'primary',
          click: (feature) => {  this.cancelEdit(workspace, layer, feature, add) }
        }] as EntityTableButton[];
      }
    }];

    columns = fields.map((field: SourceFieldsOptionsParams) => {
      return {
        name: `properties.${field.name}`,
        title: field.alias ? field.alias : field.name,
        renderer: rendereType,
        valueAccessor: undefined,
        primary: field.primary === true ? true : false,
        type: field.type
      };
    });
    columns.push(...buttons);

    workspace.meta.tableTemplate = {
      selection: true,
      sort: true,
      columns
    };

    console.log('add', columns);
  }

  public addFeature(url, feature) {
    const message = this.languageService.translate.instant(
      'igo.geo.workspace.addSuccess'
    );
    this.messageService.success(message);
    if (url) {
      // this.http.post(`${url}`, {properties}).subscribe(
      //   (data: any) => {
      //     console.log('Add success');
      //     console.log(data);
      //   }
      // );
      //console.log(url);
    }
  }

  public deleteFeature(feature, workspace, url) {
    this.http.delete(`${url}`, {}).subscribe(
      () => {
        workspace.entityStore.delete(feature);
        for (const layer of workspace.layer.map.layers) {
          if (
            layer.id !== workspace.layer.id &&
            layer.options.linkedLayers?.linkId.includes(workspace.layer.id.substr(0, workspace.layer.id.indexOf('.') - 1)) &&
            layer.options.linkedLayers?.linkId.includes('WmsWorkspaceTableSrc')
            ) {
              const olLayer = layer.dataSource.ol;
              let params = olLayer.getParams();
              params._t = new Date().getTime();
              olLayer.updateParams(params);
            }
        }

        const message = this.languageService.translate.instant(
          'igo.geo.workspace.deleteSuccess'
        );
        this.messageService.success(message);
      },
      error => {
        error.error.caught = true;
        const message = this.languageService.translate.instant(
          'igo.geo.workspace.deleteError'
        );
        this.messageService.error(message);
      }
    );
  }

  public modifyFeature(feature, workspace, url) {
    if (url) {
      this.http.patch(`${url}`, feature.properties).subscribe(
        () => {
          this.cancelEdit(workspace, workspace.layer, feature);
          const message = this.languageService.translate.instant(
            'igo.geo.workspace.modifySuccess'
          );
          this.messageService.success(message);

        },
        error => {
          error.error.caught = true;
          const message = this.languageService.translate.instant(
            'igo.geo.workspace.modifyError'
          );
          this.messageService.error(message);
        }
      );
    }
  }

  cancelEdit(workspace, layer, feature, add?){
    if (add) {
      workspace.entityStore.delete(feature);
    } else {
      const fields = layer.dataSource.options.sourceFields || [];
      const relations = layer.dataSource.options.relations || [];
      let directive: WorkspaceSelectorDirective;
      let renderType = EntityTableColumnRenderer.UnsanitizedHTML;
      let buttons = [];
      let columns = [];
      let relationsColumn = [];

      buttons = [{
        name: 'edition',
        title: undefined,
        renderer: EntityTableColumnRenderer.ButtonGroup,
        primary: false,
        valueAccessor: () => {
          return [{
            icon: 'pencil',
            color: 'primary',
            click: (feature) => { workspace.modifyFeature(feature, workspace) }
          },
          {
            icon: 'delete',
            color: 'warn',
            click: (feature) => { workspace.deleteFeature(feature, workspace) }
          }] as EntityTableButton[];
        }
      }];

      columns = fields.map((field: SourceFieldsOptionsParams) => {
        return {
          name: `properties.${field.name}`,
          title: field.alias ? field.alias : field.name,
          renderer: renderType,
          valueAccessor: undefined,
          primary: field.primary === true ? true : false,
          type: field.type
        };
      });

      relationsColumn = relations.map((relation: RelationOptions) => {
        return {
          name: `properties.${relation.name}`,
          title: relation.alias ? relation.alias : relation.name,
          renderer: EntityTableColumnRenderer.Icon,
          icon: relation.icon,
          parent: relation.parent,
          type: 'relation',
          onClick: function () { this.ws$.next(relation.title) }
        };
      });
  
      columns.push(...relationsColumn);
      columns.push(...buttons);

      workspace.meta.tableTemplate = {
        selection: true,
        sort: true,
        columns
      };
      workspace.entityStore.state.update(feature, { selected: false });
    }
  }
}
