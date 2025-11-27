/* eslint-disable no-prototype-builtins */
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { AuthInterceptor } from '@igo2/auth';
import { ActionStore } from '@igo2/common/action';
import {
  EntityStoreFilterSelectionStrategy,
  EntityTableButton,
  EntityTableColumnRenderer,
  EntityTableTemplate
} from '@igo2/common/entity';
import { ConfigService } from '@igo2/core/config';
import { MessageService } from '@igo2/core/message';
import { StorageService } from '@igo2/core/storage';

import olFeature from 'ol/Feature';
import { FeatureLoader } from 'ol/featureloader';
import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import olSourceImageWMS from 'ol/source/ImageWMS';

import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, skipWhile, take } from 'rxjs/operators';

import {
  RelationOptions,
  SourceFieldsOptionsParams,
  WMSDataSource
} from '../../datasource/shared/datasources';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { WFSDataSourceOptions } from '../../datasource/shared/datasources/wfs-datasource.interface';
import {
  Feature,
  FeatureMotion,
  FeatureStore,
  FeatureStoreInMapExtentStrategy,
  FeatureStoreInMapResolutionStrategy,
  FeatureStoreLoadingLayerStrategy,
  FeatureStoreSelectionStrategy
} from '../../feature/shared';
import { OgcFilterableDataSourceOptions } from '../../filter/shared/ogc-filter.interface';
import { isLayerItem } from '../../layer';
import {
  GeoWorkspaceOptions,
  ImageLayer,
  Layer,
  LayerService,
  LayersLinkProperties,
  LinkedProperties,
  VectorLayer
} from '../../layer/shared';
import { IgoMap, MapBase } from '../../map/shared';
import { QueryableDataSourceOptions } from '../../query/shared/query.interfaces';
import { StyleService } from '../../style/style-service/style.service';
import { EditionWorkspace } from './edition-workspace';
import { createFilterInMapExtentOrResolutionStrategy } from './workspace.utils';

@Injectable({
  providedIn: 'root'
})
export class EditionWorkspaceService {
  private layerService = inject(LayerService);
  private storageService = inject(StorageService);
  private configService = inject(ConfigService);
  private messageService = inject(MessageService);
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private styleService = inject(StyleService);
  authInterceptor? = inject(AuthInterceptor);

  public ws$ = new BehaviorSubject<string>(undefined);
  public adding$ = new BehaviorSubject<boolean>(false);
  public relationLayers$ = new BehaviorSubject<ImageLayer[] | VectorLayer[]>(
    undefined
  );
  public rowsInMapExtentCheckCondition$ = new BehaviorSubject<boolean>(true);
  public loading = false;
  public wktFormat = new WKT();
  public geoJsonFormat = new GeoJSON();

  get zoomAuto(): boolean {
    return this.storageService.get('zoomAuto') as boolean;
  }

  createWorkspace(layer: ImageLayer, map: IgoMap): EditionWorkspace {
    if (
      layer.options.workspace?.enabled !== true ||
      layer.dataSource.options.edition.enabled !== true
    ) {
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
    wksConfig.pageSize = layer.options.workspace?.pageSize;
    wksConfig.pageSizeOptions = layer.options.workspace?.pageSizeOptions;

    const dataSource: WMSDataSource = layer.dataSource as WMSDataSource;
    const wmsLinkId = layer.id + '.WmsWorkspaceTableSrc';
    const wfsLinkId = layer.id + '.WfsWorkspaceTableDest';
    if (!layer.options.linkedLayers) {
      layer.options.linkedLayers = { linkId: wmsLinkId, links: [] };
    }
    const linkProperties = {
      syncedDelete: true,
      linkedIds: [wfsLinkId],
      properties: [LinkedProperties.ZINDEX, LinkedProperties.VISIBLE]
    } as LayersLinkProperties;

    if (!layer.options.workspace?.minResolution) {
      linkProperties.properties.push(LinkedProperties.MINRESOLUTION);
    }
    let hasOgcFilters = false;
    if (
      (dataSource.options as OgcFilterableDataSourceOptions).ogcFilters?.enabled
    ) {
      linkProperties.properties.push(LinkedProperties.OGCFILTERS);
      hasOgcFilters = true;
    }
    if (!layer.options.workspace?.maxResolution) {
      linkProperties.properties.push(LinkedProperties.MAXRESOLUTION);
    }

    let clonedLinks: LayersLinkProperties[] = [];
    if (layer.options.linkedLayers.links) {
      clonedLinks = JSON.parse(
        JSON.stringify(layer.options.linkedLayers.links)
      );
    }
    clonedLinks.push(linkProperties);

    // TODO: Démystifier ce bout de code
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    ((layer.options.linkedLayers.linkId = layer.options.linkedLayers.linkId
      ? layer.options.linkedLayers.linkId
      : wmsLinkId),
      (layer.options.linkedLayers.links = clonedLinks));
    interface WFSoptions
      extends WFSDataSourceOptions, OgcFilterableDataSourceOptions {}

    layer.createLink();

    let wks;
    this.layerService
      .createAsyncLayer({
        title: layer.title,
        parentId: layer.options.parentId,
        visible: layer.visible,
        id: wfsLinkId,
        linkedLayers: {
          linkId: wfsLinkId
        },
        workspace: {
          srcId: layer.id,
          workspaceId: undefined,
          enabled: false,
          queryOptions: {
            mapQueryOnOpenTab:
              layer.options.workspace?.queryOptions?.mapQueryOnOpenTab,
            tabQuery: false
          },
          pageSize: layer.options.workspace?.pageSize,
          pageSizeOptions: layer.options.workspace?.pageSizeOptions
        },
        showInLayerList: false,
        isIgoInternalLayer: true,
        opacity: 0,
        minResolution:
          layer.options.workspace?.minResolution || layer.minResolution || 0,
        maxResolution:
          layer.options.workspace?.maxResolution ||
          layer.maxResolution ||
          Infinity,
        style: this.styleService.createStyle({
          fill: {
            color: 'rgba(255, 255, 255, 0.01)'
          },
          stroke: {
            color: 'rgba(255, 255, 255, 0.01)'
          },
          circle: {
            fill: {
              color: 'rgba(255, 255, 255, 0.01)'
            },
            stroke: {
              color: 'rgba(255, 255, 255, 0.01)'
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
          queryTitle: (dataSource.options as QueryableDataSourceOptions)
            .queryTitle,
          params: dataSource.options.paramsWFS,
          ogcFilters: Object.assign({}, dataSource.ogcFilters, {
            enabled: hasOgcFilters
          }),
          sourceFields: dataSource.options.sourceFields || undefined,
          edition: dataSource.options.edition
        } as WFSoptions
      })
      .subscribe((workspaceLayer: VectorLayer) => {
        map.layerController.add(workspaceLayer);
        layer.ol.setProperties(
          {
            linkedLayers: {
              linkId: layer.options.linkedLayers.linkId,
              links: clonedLinks
            }
          },
          false
        );
        workspaceLayer.dataSource.ol.refresh();

        wks = new EditionWorkspace(
          this.dialog,
          this.configService,
          this.adding$,
          (relation: RelationOptions) => this.getDomainValues(relation),
          {
            id: layer.id,
            title: layer.title,
            layer: workspaceLayer,
            map,
            entityStore: this.createFeatureStore(workspaceLayer, map),
            actionStore: new ActionStore([]),
            meta: {
              tableTemplate: undefined
            }
          }
        );
        this.createTableTemplate(wks, workspaceLayer);

        workspaceLayer.options.workspace.workspaceId = workspaceLayer.id;
        layer.options.workspace = Object.assign({}, layer.options.workspace, {
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
    store.addStrategy(createFilterInMapExtentOrResolutionStrategy(), true);
    return store;
  }

  private createTableTemplate(
    workspace: EditionWorkspace,
    layer: VectorLayer
  ): EntityTableTemplate {
    const fields = layer.dataSource.options.sourceFields || [];

    const relations = layer.dataSource.options.relations || [];

    const rendererType = EntityTableColumnRenderer.UnsanitizedHTML;
    let buttons = [];
    let columns = [];
    let relationsColumn = [];

    buttons = [
      {
        name: 'edition',
        title: undefined,
        renderer: EntityTableColumnRenderer.ButtonGroup,
        primary: false,
        valueAccessor: () => {
          return [
            {
              editMode: false,
              icon: 'edit',
              color: 'primary',
              disabled:
                layer.dataSource.options.edition.modifyButton === false
                  ? true
                  : false,
              click: (feature) => {
                workspace.editFeature(feature, workspace);
              }
            },
            {
              editMode: false,
              icon: 'delete',
              color: 'warn',
              disabled:
                layer.dataSource.options.edition.deleteButton === false
                  ? true
                  : false,
              click: (feature) => {
                workspace.deleteFeature(feature, workspace);
              }
            },
            {
              editMode: true,
              icon: 'check',
              color: 'primary',
              disabled: this.loading,
              click: (feature) => {
                this.saveFeature(feature, workspace);
              }
            },
            {
              editMode: true,
              icon: 'close',
              color: 'primary',
              disabled: this.loading,
              click: (feature) => {
                this.cancelEdit(workspace, feature);
              }
            }
          ] as EntityTableButton[];
        }
      }
    ];

    if (fields.length === 0) {
      workspace.entityStore.entities$
        .pipe(
          skipWhile((val) => val.length === 0),
          take(1)
        )
        .subscribe((entities) => {
          const ol = (entities[0] as Feature).ol as olFeature<OlGeometry>;
          const columnsFromFeatures = ol
            .getKeys()
            .filter(
              (col) =>
                !col.startsWith('_') &&
                col !== 'geometry' &&
                col !== ol.getGeometryName() &&
                !col.match(/boundedby/gi)
            )
            .map((key) => {
              return {
                name: `properties.${key}`,
                title: key,
                renderer: rendererType
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
      const column = {
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
        linkColumnForce: field.linkColumnForce,
        type: field.type,
        domainValues: undefined,
        relation: undefined,
        multiple: field.multiple,
        step: field.step,
        tooltip: field.tooltip
      };

      if (field.type === 'list' || field.type === 'autocomplete') {
        this.getDomainValues(field.relation).subscribe((result) => {
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
        tooltip: relation.tooltip,
        onClick: () => {
          if (this.adding$.getValue() === false) {
            this.ws$.next(relation.title);
          }
        },
        cellClassFunc: () => {
          return { class_icon: true };
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

  public saveFeature(feature, workspace: EditionWorkspace) {
    if (!this.validateFeature(feature, workspace)) {
      return false;
    }

    this.sanitizeParameter(feature, workspace);

    const baseUrl = workspace.layer.dataSource.options.edition.baseUrl;
    let url = this.configService.getConfig('edition.url');

    if (!url) {
      url = baseUrl;
    } else {
      url += baseUrl ? baseUrl : '';
    }

    if (feature.newFeature) {
      url += workspace.layer.dataSource.options.edition.addUrl;

      const addHeaders = workspace.layer.dataSource.options.edition.addHeaders;
      const headers = new HttpHeaders(addHeaders);

      this.addFeature(feature, workspace, url, headers);
    } else {
      if (
        workspace.layer.dataSource.options.edition.modifyProtocol !== 'post'
      ) {
        url +=
          '?' +
          workspace.layer.dataSource.options.edition.modifyUrl +
          feature.idkey;
      } else {
        url += workspace.layer.dataSource.options.edition.modifyUrl;
      }

      const protocole =
        workspace.layer.dataSource.options.edition.modifyProtocol;
      const modifyHeaders =
        workspace.layer.dataSource.options.edition.modifyHeaders;
      const headers = new HttpHeaders(modifyHeaders);

      this.modifyFeature(feature, workspace, url, headers, protocole);
    }
  }

  public addFeature(
    feature,
    workspace: EditionWorkspace,
    url: string,
    headers: Record<string, any>
  ) {
    if (workspace.layer.dataSource.options.edition.hasGeometry) {
      const projDest =
        workspace.layer.options.sourceOptions.edition.geomDatabaseProj;
      feature.properties[
        workspace.layer.dataSource.options.params.fieldNameGeometry
      ] =
        'SRID=' +
        projDest.replace('EPSG:', '') +
        ';' +
        this.wktFormat.writeGeometry(
          (
            this.geoJsonFormat.readFeature(
              feature.geometry
            ) as olFeature<OlGeometry>
          )
            .getGeometry()
            .transform('EPSG:4326', projDest),
          { dataProjection: projDest }
        );
    }

    for (const property in feature.properties) {
      for (const sf of workspace.layer.dataSource.options.sourceFields) {
        if (
          (sf.name === property && sf.validation?.readonly) ||
          (sf.name === property && sf.validation?.send === false)
        ) {
          delete feature.properties[property];
        }
      }
    }

    this.loading = true;
    this.http
      .post(`${url}`, feature.properties, { headers: headers })
      .subscribe(
        () => {
          this.loading = false;
          workspace.entityStore.stateView.clear();
          workspace.deleteDrawings();
          workspace.entityStore.delete(feature);

          this.messageService.success('igo.geo.workspace.addSuccess');

          this.refreshMap(workspace.layer as VectorLayer, workspace.layer.map);
          this.adding$.next(false);
          this.rowsInMapExtentCheckCondition$.next(true);
        },
        (error) => {
          this.loading = false;
          error.error.caught = true;
          const messages = workspace.layer.dataSource.options.edition.messages;
          if (messages) {
            let text;
            messages.forEach((message) => {
              const key = Object.keys(message)[0];
              if (error.error.message.includes(key)) {
                text = message[key];
                this.messageService.error(text);
              }
            });
            if (!text) {
              this.messageService.error('igo.geo.workspace.addError');
            }
          } else {
            this.messageService.error('igo.geo.workspace.addError');
          }
        }
      );
  }

  public deleteFeature(workspace: EditionWorkspace, url: string) {
    this.loading = true;
    this.http.delete(`${url}`, {}).subscribe(
      () => {
        this.loading = false;
        this.messageService.success('igo.geo.workspace.deleteSuccess');

        this.refreshMap(workspace.layer as VectorLayer, workspace.layer.map);
        const relations =
          workspace.layer.options.sourceOptions?.relations ?? [];
        for (const relation of relations) {
          const layer = workspace.map.layerController.all.find(
            (layer) => isLayerItem(layer) && layer.title === relation.title
          ) as Layer;
          layer?.dataSource.ol.refresh();
        }
      },
      (error) => {
        this.loading = false;
        error.error.caught = true;
        const messages = workspace.layer.dataSource.options.edition.messages;
        if (messages) {
          let text;
          messages.forEach((message) => {
            const key = Object.keys(message)[0];
            if (error.error.message.includes(key)) {
              text = message[key];
              this.messageService.error(text);
            }
          });
          if (!text) {
            this.messageService.error('igo.geo.workspace.addError');
          }
        } else {
          this.messageService.error('igo.geo.workspace.addError');
        }
      }
    );
  }

  public modifyFeature(
    feature,
    workspace: EditionWorkspace,
    url: string,
    headers: Record<string, any>,
    protocole = 'patch'
  ) {
    if (workspace.layer.dataSource.options.edition.hasGeometry) {
      const projDest =
        workspace.layer.options.sourceOptions.edition.geomDatabaseProj;
      // Remove 3e dimension
      feature.geometry.coordinates = removeZ(feature.geometry.coordinates);
      feature.properties[
        workspace.layer.dataSource.options.params.fieldNameGeometry
      ] =
        'SRID=' +
        projDest.replace('EPSG:', '') +
        ';' +
        this.wktFormat.writeGeometry(
          (
            this.geoJsonFormat.readFeature(
              feature.geometry
            ) as olFeature<OlGeometry>
          )
            .getGeometry()
            .transform('EPSG:4326', projDest),
          { dataProjection: projDest }
        );
    }

    for (const property in feature.properties) {
      for (const sf of workspace.layer.dataSource.options.sourceFields) {
        if (
          (sf.name === property && sf.validation?.readonly) ||
          (sf.name === property && sf.validation?.send === false) ||
          property === 'boundedBy'
        ) {
          delete feature.properties[property];
        }
      }
    }

    this.loading = true;
    this.http[protocole](`${url}`, feature.properties, {
      headers: headers
    }).subscribe(
      () => {
        this.loading = false;
        this.cancelEdit(workspace, feature, true);

        this.messageService.success('igo.geo.workspace.modifySuccess');

        this.refreshMap(workspace.layer as VectorLayer, workspace.layer.map);

        const relationLayers = [];
        workspace.layer.options.sourceOptions.relations?.forEach((relation) => {
          workspace.map.layerController.all.forEach((layer) => {
            if (isLayerItem(layer) && layer.title === relation.title) {
              relationLayers.push(layer);
              layer.dataSource.ol.refresh();
            }
          });
        });
        this.relationLayers$.next(relationLayers);
      },
      (error) => {
        this.loading = false;
        error.error.caught = true;
        const messages = workspace.layer.dataSource.options.edition.messages;
        if (messages) {
          let text;
          messages.forEach((message) => {
            const key = Object.keys(message)[0];
            if (error.error.message.includes(key)) {
              text = message[key];
              this.messageService.error(text);
            }
          });
          if (!text) {
            this.messageService.error('igo.geo.workspace.addError');
          }
        } else {
          this.messageService.error('igo.geo.workspace.addError');
        }
      }
    );
  }

  cancelEdit(workspace: EditionWorkspace, feature, fromSave = false) {
    feature.edition = false;
    this.adding$.next(false);
    workspace.deleteDrawings();
    workspace.entityStore.stateView.clear();

    if (feature.newFeature) {
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

  getDomainValues(relation: RelationOptions): Observable<any> {
    let url = relation.url;
    if (!url) {
      url = this.configService.getConfig('edition.url')
        ? this.configService.getConfig('edition.url') + relation.table
        : relation.table;
    }

    return this.http.get<any>(url).pipe(
      map((result) => {
        return result;
      }),
      catchError((err: HttpErrorResponse) => {
        err.error.caught = true;
        return throwError(err);
      })
    );
  }

  /*
   * Refresh both wms and wfs layer
   * A new wfs loader is used to ensure cache is not retrieving old data
   * WMS params are updated to ensure layer is correctly refreshed
   */
  refreshMap(layer: VectorLayer, map: MapBase) {
    const wfsOlLayer = layer.dataSource.ol;
    const loader: FeatureLoader = (
      extent,
      resolution,
      proj,
      success,
      failure
    ) => {
      layer.customWFSLoader(
        layer.ol.getSource(),
        layer.options.sourceOptions as WFSDataSourceOptions,
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

    const id = String(layer.id);
    for (const lay of map.layerController.all) {
      if (
        isLayerItem(lay) &&
        lay.id !== layer.id &&
        lay.options.linkedLayers?.linkId
          .toString()
          .includes(id.substr(0, id.indexOf('.') - 1)) &&
        lay.options.linkedLayers?.linkId
          .toString()
          .includes('WmsWorkspaceTableSrc')
      ) {
        const wmsOlLayer = lay.dataSource.ol as olSourceImageWMS;
        const params = wmsOlLayer.getParams();
        params._t = new Date().getTime();
        wmsOlLayer.updateParams(params);
      }
    }
  }

  validateFeature(feature, workspace: EditionWorkspace) {
    let key;
    let valid = true;
    workspace.meta.tableTemplate.columns.forEach((column) => {
      if (column.hasOwnProperty('validation') && column.validation) {
        key = getColumnKeyWithoutPropertiesTag(column.name);
        Object.keys(column.validation).forEach((type) => {
          switch (type) {
            case 'mandatory': {
              if (
                column.validation[type] &&
                (!feature.properties.hasOwnProperty(key) ||
                  !feature.properties[key])
              ) {
                valid = false;
                this.messageService.error(
                  'igo.geo.formValidation.mandatory',
                  undefined,
                  undefined,
                  { column: column.title }
                );
              }
              break;
            }
            case 'minValue': {
              if (
                feature.properties.hasOwnProperty(key) &&
                feature.properties[key] &&
                feature.properties[key] < column.validation[type]
              ) {
                valid = false;
                this.messageService.error(
                  'igo.geo.formValidation.minValue',
                  undefined,
                  undefined,
                  {
                    column: column.title,
                    value: column.validation[type]
                  }
                );
              }
              break;
            }
            case 'maxValue': {
              if (
                feature.properties.hasOwnProperty(key) &&
                feature.properties[key] &&
                feature.properties[key] > column.validation[type]
              ) {
                valid = false;
                this.messageService.error(
                  'igo.geo.formValidation.maxValue',
                  undefined,
                  undefined,
                  {
                    column: column.title,
                    value: column.validation[type]
                  }
                );
              }
              break;
            }
            case 'minLength': {
              if (
                feature.properties.hasOwnProperty(key) &&
                feature.properties[key] &&
                feature.properties[key].length < column.validation[type]
              ) {
                valid = false;
                this.messageService.error(
                  'igo.geo.formValidation.minLength',
                  undefined,
                  undefined,
                  {
                    column: column.title,
                    value: column.validation[type]
                  }
                );
              }
              break;
            }
            case 'maxLength': {
              if (
                feature.properties.hasOwnProperty(key) &&
                feature.properties[key] &&
                feature.properties[key].length > column.validation[type]
              ) {
                valid = false;
                this.messageService.error(
                  'igo.geo.formValidation.maxLength',
                  undefined,
                  undefined,
                  {
                    column: column.title,
                    value: column.validation[type]
                  }
                );
              }
              break;
            }
          }
        });
      }
    });
    return valid;
  }

  sanitizeParameter(feature, workspace: EditionWorkspace) {
    workspace.meta.tableTemplate.columns.forEach((column) => {
      if (
        column.type === 'list' &&
        feature.properties[getColumnKeyWithoutPropertiesTag(column.name)]
      ) {
        feature.properties[getColumnKeyWithoutPropertiesTag(column.name)] =
          feature.properties[
            getColumnKeyWithoutPropertiesTag(column.name)
          ].toString();
      }
    });
  }
}

function getColumnKeyWithoutPropertiesTag(column: string) {
  if (column.includes('properties.')) {
    return column.split('.')[1];
  }
  return column;
}

function removeZ(coords: any) {
  if (coords.length === 0) return coords;
  if (typeof coords[0] === 'number') return coords.slice(0, 2);
  return coords.map(removeZ);
}
