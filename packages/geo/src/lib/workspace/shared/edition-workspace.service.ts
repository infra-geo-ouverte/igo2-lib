import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
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
import { AuthInterceptor } from '@igo2/auth';
import { catchError, map, skipWhile, take } from 'rxjs/operators';
import { RelationOptions, SourceFieldsOptionsParams, WMSDataSource } from '../../datasource';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { WFSDataSourceOptions } from '../../datasource/shared/datasources/wfs-datasource.interface';
import {
  Feature,
  FeatureMotion,
  FeatureStore,
  FeatureStoreInMapExtentStrategy,
  FeatureStoreInMapResolutionStrategy,
  FeatureStoreLoadingLayerStrategy,
  FeatureStoreSelectionStrategy} from '../../feature';

import { OgcFilterableDataSourceOptions } from '../../filter/shared/ogc-filter.interface';
import { ImageLayer, LayerService, LayersLinkProperties, LinkedProperties, VectorLayer } from '../../layer';
import { GeoWorkspaceOptions } from '../../layer/shared/layers/layer.interface';
import { IgoMap } from '../../map';
import { QueryableDataSourceOptions } from '../../query/shared/query.interfaces';
import { EditionWorkspace } from './edition-workspace';

import olFeature from 'ol/Feature';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import { BehaviorSubject, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditionWorkspaceService {

  public ws$ = new BehaviorSubject<string>(undefined);
  public rowsInMapExtentCheckCondition$ = new BehaviorSubject<boolean>(true);

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
    private dialog: MatDialog,
    public authInterceptor?: AuthInterceptor) { }

  createWorkspace(layer: ImageLayer, map: IgoMap): EditionWorkspace {
    if (layer.options.workspace?.enabled !== true || layer.dataSource.options.edition.enabled !== true) {
      return;
    }
    let wksConfig;
    if (layer.options.workspace) {
      wksConfig = layer.options.workspace;
    } else {
      wksConfig = {};
    }
    wksConfig.srcId = layer.id;
    wksConfig.workspaceId = layer.id;
    wksConfig.enabled = true;
    wksConfig.noQueryOnClickInTab = true;
    wksConfig.noMapQueryOnOpenTab = true;

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
          noMapQueryOnOpenTab: true,
          noQueryOnClickInTab: true
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
            wksConfig
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
      valueAccessor: () => {
        return [{
          editMode: false,
          icon: 'pencil',
          color: 'primary',
          click: (feature) => { workspace.editFeature(feature, workspace); }
        },
        {
          editMode: false,
          icon: 'delete',
          color: 'warn',
          click: (feature) => { workspace.deleteFeature(feature, workspace); }
        },
        {
          editMode: true,
          icon: 'check',
          color: 'primary',
          click: (feature) => { this.saveFeature(feature, workspace); }
        },
        {
          editMode: true,
          icon: 'alpha-x',
          color: 'primary',
          click: (feature) => { this.cancelEdit(workspace, feature); }
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
          selection: false,
          sort: true,
          columns: columnsFromFeatures
        };
      });
      return;
    }

    columns = fields.map((field: SourceFieldsOptionsParams) => {

      let column = {
        name: `properties.${field.name}`,
        title: field.alias ? field.alias : field.name,
        renderer: rendererType,
        valueAccessor: undefined,
        cellClassFunc: () => {
          const cellClass = {};
          if (field.type) {
            cellClass[`class_${field.type}`] = true;
            return cellClass;
          }
        },
        primary: field.primary === true ? true : false,
        visible: field.visible,
        validation: field.validation,
        valueReturn: field.valueReturn,
        type: field.type,
        domainValues: undefined,
        relation: undefined,
        multiple: field.multiple,
        step: field.step
      };

      if (field.type === 'list' || field.type === 'autocomplete') {
        this.getDomainValues(field.relation.table).subscribe(result => {
          column.domainValues = result;
          column.relation = field.relation;
        });
      }
      return column;
    });

    relationsColumn = relations.map((relation: RelationOptions) => {
      return {
        name: `properties.${relation.name}`,
        title: relation.alias ? relation.alias : relation.name,
        renderer: EntityTableColumnRenderer.Icon,
        icon: relation.icon,
        parent: relation.parent,
        type: 'relation',
        onClick: () => { this.ws$.next(relation.title); },
        cellClassFunc: () => {
          return { 'class_icon': true };
      }
      };
    });

    columns.push(...relationsColumn);
    columns.push(...buttons);

    workspace.meta.tableTemplate = {
      selection: false,
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

  public saveFeature(feature, workspace) {
    if (!this.validateFeature(feature, workspace)){
      return false;
    }

    this.sanitizeParameter(feature, workspace);

    let url = this.configService.getConfig('edition.url');

    if (workspace.layer.dataSource.options.edition.baseUrl) {
      url+= workspace.layer.dataSource.options.edition.baseUrl;
    }

    if (feature.newFeature) {
      url += workspace.layer.dataSource.options.edition.addUrl;

      const addHeaders = workspace.layer.dataSource.options.edition.addHeaders;
      const headers = new HttpHeaders(addHeaders);

      this.addFeature(feature, workspace, url, headers);
    } else {
      if (workspace.layer.dataSource.options.edition.modifyProtocole !== "post") {
        url += '?' + workspace.layer.dataSource.options.edition.modifyUrl + feature.idkey;
      }
      else {
        url += workspace.layer.dataSource.options.edition.modifyUrl;
      }

      const protocole = workspace.layer.dataSource.options.edition.modifyProtocole;
      const modifyHeaders = workspace.layer.dataSource.options.edition.modifyHeaders;
      const headers = new HttpHeaders(modifyHeaders);

      this.modifyFeature(feature, workspace, url, headers, protocole);
    }
  }

  public addFeature(feature, workspace, url, headers) {
    const geom = workspace.layer.dataSource.options.edition.geomField;
    if (geom) {
      //feature.properties[geom] = feature.geometry; TODO: ADJUST FOR POLYGON/LINE
      feature.properties["longitude"] = feature.geometry.coordinates[0];
      feature.properties["latitude"] = feature.geometry.coordinates[1];
    }

    if (url) {
      this.http.post(`${url}`, feature.properties, { headers: headers}).subscribe(
        () => {
          workspace.entityStore.stateView.clear();
          workspace.deleteDrawings();
          workspace.entityStore.delete(feature);

          const message = this.languageService.translate.instant(
            'igo.geo.workspace.addSuccess'
          );
          this.messageService.success(message);

          this.refreshMap(workspace.layer, workspace.layer.map);
          this.rowsInMapExtentCheckCondition$.next(true);
        },
        error => {
          error.error.caught = true;
          const genericErrorMessage = this.languageService.translate.instant(
            'igo.geo.workspace.addError'
          );
          const messages = workspace.layer.dataSource.options.edition.messages;
          if (messages) {
            let text;
            messages.forEach(message => {
              const key = Object.keys(message)[0];
              if (error.error.message.includes(key)) {
                text = message[key];
                this.messageService.error(text);
              }
            });
            if (!text) {
              this.messageService.error(genericErrorMessage);
            }
          } else {
            this.messageService.error(genericErrorMessage);
          }
        }
      );
    }
  }

  public deleteFeature(workspace, url) {
    this.http.delete(`${url}`, {}).subscribe(
      () => {
        const message = this.languageService.translate.instant(
          'igo.geo.workspace.deleteSuccess'
        );
        this.messageService.success(message);

        this.refreshMap(workspace.layer, workspace.layer.map);
        for (const relation of workspace.layer.options.sourceOptions.relations) {
          workspace.map.layers.forEach((layer) => {
            if (layer.title === relation.title) {
              layer.dataSource.ol.refresh();
            }
          });
        }
      },
      error => {
        error.error.caught = true;
          const genericErrorMessage = this.languageService.translate.instant(
            'igo.geo.workspace.addError'
          );
          const messages = workspace.layer.dataSource.options.edition.messages;
          if (messages) {
            let text;
            messages.forEach(message => {
              const key = Object.keys(message)[0];
              if (error.error.message.includes(key)) {
                text = message[key];
                this.messageService.error(text);
              }
            });
            if (!text) {
              this.messageService.error(genericErrorMessage);
            }
          } else {
            this.messageService.error(genericErrorMessage);
          }
      }
    );
  }

  public modifyFeature(feature, workspace, url, headers, protocole='patch' ) {
    //TODO: adapt to any kind of geometry
    const geom = workspace.layer.dataSource.options.edition.geomField;
    if (geom) {
      //feature.properties[geom] = feature.geometry;
      feature.properties["longitude"] = feature.geometry.coordinates[0];
      feature.properties["latitude"] = feature.geometry.coordinates[1];
    }
    const featureProperties = JSON.parse(JSON.stringify(feature.properties));
    delete featureProperties.boundedBy;
    if (url) {
      this.http[protocole](`${url}`, featureProperties, { headers: headers }).subscribe(
        () => {
          this.cancelEdit(workspace, feature, true);

          const message = this.languageService.translate.instant(
            'igo.geo.workspace.modifySuccess'
          );
          this.messageService.success(message);

          this.refreshMap(workspace.layer, workspace.layer.map);
        },
        error => {
          error.error.caught = true;
          const genericErrorMessage = this.languageService.translate.instant(
            'igo.geo.workspace.addError'
          );
          const messages = workspace.layer.dataSource.options.edition.messages;
          if (messages) {
            let text;
            messages.forEach(message => {
              const key = Object.keys(message)[0];
              if (error.error.message.includes(key)) {
                text = message[key];
                this.messageService.error(text);
              }
            });
            if (!text) {
              this.messageService.error(genericErrorMessage);
            }
          } else {
            this.messageService.error(genericErrorMessage);
          }
        }
      );
    }
  }

  cancelEdit(workspace, feature, fromSave = false) {
    feature.edition = false;
    workspace.deleteDrawings();
    if (feature.newFeature) {
      workspace.entityStore.stateView.clear();
      workspace.entityStore.delete(feature);
      workspace.deactivateDrawControl();
      this.rowsInMapExtentCheckCondition$.next(true);
    } else {
      if (!fromSave) {
        feature.properties = feature.original_properties;
        feature.geometry = feature.original_geometry;
      }
      delete feature.original_properties;
      delete feature.original_geometry;
    }
  }

  getDomainValues(table): Observable<any> {
    let url = this.configService.getConfig('edition.url') + table;

    return this.http.get<any>(url).pipe(
      map(result => {
        return result;
      }),
      catchError((err: HttpErrorResponse) => {
        return throwError(err);
      })
    );
  }

  /*
   * Refresh both wms and wfs layer
   * A new wfs loader is used to ensure cache is not retrieving old data
   * WMS params are updated to ensure layer is correctly refreshed
   */
  refreshMap(layer: VectorLayer, map) {
    const wfsOlLayer = layer.dataSource.ol;
    const loader = (extent, resolution, proj, success, failure) => {
      layer.customWFSLoader(
        layer.ol.getSource(),
        layer.options.sourceOptions,
        this.authInterceptor,
        extent,
        resolution,
        proj,
        success,
        failure,
        true
      );
    };
    wfsOlLayer.setLoader(loader);
    wfsOlLayer.refresh();

    for (const lay of map.layers) {
      if (
        lay.id !== layer.id &&
        lay.options.linkedLayers?.linkId.includes(layer.id.substr(0, layer.id.indexOf('.') - 1)) &&
        lay.options.linkedLayers?.linkId.includes('WmsWorkspaceTableSrc')
      )
        {
          const wmsOlLayer = lay.dataSource.ol;
          let params = wmsOlLayer.getParams();
          params._t = new Date().getTime();
          wmsOlLayer.updateParams(params);
        }
    }
  }

  validateFeature(feature, workspace) {
    const translate = this.languageService.translate;
    let message ;
    let key;
    let valid = true;
    workspace.meta.tableTemplate.columns.forEach(column => {
      if (column.hasOwnProperty('validation') && column.validation) {
        key = getColumnKeyWithoutPropertiesTag(column.name);
        Object.keys( column.validation).forEach((type) => {
          switch (type) {
            case 'mandatory': {
              if (column.validation[type] && (!feature.properties.hasOwnProperty(key) || !feature.properties[key])) {
                valid = false;
                  message = translate.instant('igo.geo.formValidation.mandatory',
                  {
                    column: column.title
                  }
                );
                this.messageService.error(message);
              }
              break;
            }
            case 'minValue': {
              if (feature.properties.hasOwnProperty(key) && feature.properties[key] && feature.properties[key] < column.validation[type]) {
                valid = false;
                message = translate.instant('igo.geo.formValidation.minValue',
                  {
                    column: column.title,
                    value: column.validation[type]
                  }
                );
                this.messageService.error(message);
              }
              break;
            }
            case 'maxValue': {
              if (feature.properties.hasOwnProperty(key) && feature.properties[key] && feature.properties[key] > column.validation[type]) {
                valid = false;
                message = translate.instant('igo.geo.formValidation.maxValue',
                  {
                    column: column.title,
                    value: column.validation[type]
                  }
                );
                this.messageService.error(message);
              }
              break;
            }
            case 'minLength': {
              if (
                feature.properties.hasOwnProperty(key) && feature.properties[key] &&
                feature.properties[key].length < column.validation[type])
              {
                valid = false;
                message = translate.instant('igo.geo.formValidation.minLength',
                  {
                    column: column.title,
                    value: column.validation[type]
                  }
                );
                this.messageService.error(message);
              }
              break;
            }
            case 'maxLength': {
              if (
                feature.properties.hasOwnProperty(key) && feature.properties[key] &&
                feature.properties[key].length > column.validation[type])
              {
                valid = false;
                message = translate.instant('igo.geo.formValidation.maxLength',
                  {
                    column: column.title,
                    value: column.validation[type]
                  }
                );
                this.messageService.error(message);
              }
              break;
            }
            }
          });
      }
    });
    return valid;
  }

  sanitizeParameter(feature, workspace) {
    workspace.meta.tableTemplate.columns.forEach(column => {
      if (column.type === 'list' && feature.properties[getColumnKeyWithoutPropertiesTag(column.name)]) {
        feature.properties[getColumnKeyWithoutPropertiesTag(column.name)] =
          feature.properties[getColumnKeyWithoutPropertiesTag(column.name)].toString();
      }

    });
  }

}

function getColumnKeyWithoutPropertiesTag(column) {
  if (column.includes('properties.')) {
    return column.split('.')[1];
  }
  return column;
}
