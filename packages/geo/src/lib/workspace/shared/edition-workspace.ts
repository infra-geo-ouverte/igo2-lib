import { MatDialog } from '@angular/material/dialog';
import { Workspace, WorkspaceOptions, EntityRecord } from '@igo2/common';
import { ConfigService } from '@igo2/core';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';

import { ImageLayer, VectorLayer } from '../../layer/shared';
import { IgoMap } from '../../map/shared';
import { ConfirmationPopupComponent } from '../confirmation-popup/confirmation-popup.component';
import { DrawControl } from '../../geometry';
import { createInteractionStyle, GeometryType } from '../../draw';
import { featureToOl } from '../../feature';

import type { Type } from 'ol/geom/Geometry';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import OlGeoJSON from 'ol/format/GeoJSON';
import OlVectorSource from 'ol/source/Vector';
import * as OlStyle from 'ol/style';
import OlModify from 'ol/interaction/Modify';
import Collection from 'ol/Collection';
import OlFeature from 'ol/Feature';
import { FeatureDataSource, RelationOptions } from '../../datasource/shared';

export interface EditionWorkspaceOptions extends WorkspaceOptions {
  layer: ImageLayer | VectorLayer;
  map: IgoMap;
}

export class EditionWorkspace extends Workspace {
  readonly inResolutionRange$: BehaviorSubject<boolean> = new BehaviorSubject(
    true
  );

  get layer(): ImageLayer | VectorLayer {
    return this.options.layer;
  }

  get map(): IgoMap {
    return this.options.map;
  }

  private drawControl: DrawControl;
  private drawEnd$$: Subscription;
  private olDrawingLayerSource = new OlVectorSource();
  private olDrawingLayer: VectorLayer;
  public geometryType = GeometryType; // Reference to the GeometryType enum
  public modify; // Reference to the ol interaction

  public modifyStyle = new OlStyle.Style({
    stroke: new OlStyle.Stroke({
      color: 'rgba(255,255,255,1)',
      width: 1
    }),
    fill: new OlStyle.Fill({
      color: 'rgba(0,161,222,1)'
    }),
    image: new OlStyle.Circle({
      radius: 7,
      stroke: new OlStyle.Stroke({
        color: 'rgba(255,255,255,1)',
        width: 1
      }),
      fill: new OlStyle.Fill({
        color: 'rgba(0,161,222,1)'
      })
    })
  });

  private newFeaturefilterClauseFunc = (record: EntityRecord<object>) => {
    return record.state.newFeature === true;
  };

  private editFeaturefilterClauseFunc = (record: EntityRecord<object>) => {
    return record.state.edit === true;
  };

  public fillColor: string;
  public strokeColor: string;
  public strokeWidth: number;

  constructor(
    private dialog: MatDialog,
    private configService: ConfigService,
    private adding$: BehaviorSubject<boolean>,
    private getDomainValues: (relation: RelationOptions) => Observable<any>,
    protected options: EditionWorkspaceOptions
  ) {
    super(options);
    this.map.viewController.resolution$.subscribe((mapResolution) => {
      if (
        mapResolution > this.layer.minResolution &&
        mapResolution < this.layer.maxResolution
      ) {
        this.inResolutionRange$.next(true);
      } else {
        this.inResolutionRange$.next(false);
      }
    });

    this.drawControl = this.createDrawControl();
    this.drawControl.setGeometryType(this.geometryType.Point as any);

    this.map.removeLayer(this.olDrawingLayer);

    this.olDrawingLayer = new VectorLayer({
      id: 'igo-draw-layer',
      title: 'edition',
      zIndex: 300,
      source: new FeatureDataSource(),
      showInLayerList: false,
      exportable: false,
      browsable: false,
      workspace: {
        enabled: false
      }
    });
  }

  deleteFeature(feature, workspace) {
    setTimeout(() => {
      const dialogRef = this.dialog.open(ConfirmationPopupComponent, {
        disableClose: false,
        data: { type: 'delete' }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result === false) {
          let id, url;
          const baseUrl = workspace.layer.dataSource.options.edition.baseUrl;
          const deleteUrl =
            workspace.layer.dataSource.options.edition.deleteUrl;
          if (baseUrl.length) {
            url = this.configService.getConfig('edition.url')
              ? this.configService.getConfig('edition.url') +
                baseUrl +
                '?' +
                deleteUrl
              : baseUrl + '?' + deleteUrl;
          } else {
            url = this.configService.getConfig('edition.url')
              ? this.configService.getConfig('edition.url') + deleteUrl
              : deleteUrl;
          }

          for (const column of workspace.meta.tableTemplate.columns) {
            for (const property in feature.properties) {
              let columnName = column.name;
              if (columnName.includes('properties.')) {
                columnName = columnName.split('.')[1];
              }
              if (columnName === property && column.primary === true) {
                id = feature.properties[property];
              }
            }
          }
          if (url) {
            url += id;
            this.deleteFeature(workspace, url);
          }
        }
      });
    }, 250);
  }

  editFeature(feature, workspace: EditionWorkspace) {
    feature.edition = true;
    let id;
    let find = false;
    const editionOpt = workspace.layer.dataSource.options.edition;
    for (const column of workspace.meta.tableTemplate.columns) {
      // Update domain list
      if (column.type === 'list' || column.type === 'autocomplete') {
        this.getDomainValues(column.relation).subscribe((result) => {
          column.domainValues = result;
        });
      }
      if (find === false) {
        for (const property in feature.properties) {
          let columnName = column.name;
          if (columnName.includes('properties.')) {
            columnName = columnName.split('.')[1];
          }
          if (columnName === property && column.primary === true) {
            id = feature.properties[property];
            find = true;
            break;
          }
        }
      }
    }
    if (id) {
      feature.original_properties = JSON.parse(
        JSON.stringify(feature.properties)
      );
      feature.original_geometry = feature.geometry;
      feature.idkey = id;
      workspace.entityStore.state.updateAll({ edit: false });
      workspace.entityStore.stateView.filter(this.editFeaturefilterClauseFunc);
      this.addFeatureToStore(feature, workspace);
    } else {
      // Only for edition with it's own geometry
      if (!feature.newFeature && editionOpt.geomType) {
        feature.newFeature = true;
        this.adding$.next(true);
        workspace.entityStore.state.updateAll({ newFeature: false });
        workspace.entityStore.stateView.filter(this.newFeaturefilterClauseFunc);
        if (editionOpt.addWithDraw) {
          const geometryType = editionOpt.geomType;
          this.onGeometryTypeChange(geometryType, feature, workspace);
        } else {
          workspace.entityStore.insert(feature);
          workspace.entityStore.state.update(
            feature,
            { newFeature: true },
            true
          );
        }
      }
    }
  }

  /**
   * Create a Draw Control
   * @param fillColor the fill color
   * @param strokeColor the stroke color
   * @param strokeWidth the stroke width
   * @returns a Draw Control
   */
  createDrawControl(
    fillColor?: string,
    strokeColor?: string,
    strokeWidth?: number
  ) {
    const drawControl = new DrawControl({
      geometryType: undefined,
      drawingLayerSource: this.olDrawingLayerSource,
      drawingLayerStyle: new OlStyle.Style({}),
      interactionStyle: createInteractionStyle(
        fillColor,
        strokeColor,
        strokeWidth
      )
    });

    return drawControl;
  }

  /**
   * Called when the user selects a new geometry type
   * @param geometryType the geometry type selected by the user
   */
  onGeometryTypeChange(
    geometryType: Type,
    feature,
    workspace: EditionWorkspace
  ) {
    this.drawControl.setGeometryType(geometryType);
    this.toggleDrawControl(feature, workspace);
  }

  /**
   * Activate the correct control
   */
  private toggleDrawControl(feature, workspace: EditionWorkspace) {
    this.deactivateDrawControl();
    this.activateDrawControl(feature, workspace);
  }

  /**
   * Deactivate the active draw control
   */
  public deactivateDrawControl() {
    if (!this.drawControl) {
      return;
    }

    if (this.drawEnd$$) {
      this.drawEnd$$.unsubscribe();
    }

    this.drawControl.setOlMap(undefined);
  }

  /**
   * Activate a given control
   */
  private activateDrawControl(feature, workspace: EditionWorkspace) {
    this.drawEnd$$ = this.drawControl.end$.subscribe(
      (olGeometry: OlGeometry) => {
        this.addFeatureToStore(feature, workspace, olGeometry);
      }
    );

    this.drawControl.setOlMap(this.map.ol, true);
  }

  /**
   * Add a feature to layer. The loading strategy of the layer
   * will trigger and add the feature to the workspace store.
   * @internal
   */
  private addFeatureToStore(
    feature,
    workspace: EditionWorkspace,
    olGeometry?: OlGeometry
  ) {
    const projection = this.map.ol.getView().getProjection();
    let geometry = feature.geometry;

    // If an olGeometry is passed, it means that it is a new feature
    if (olGeometry) {
      workspace.entityStore.insert(feature);
      workspace.entityStore.state.update(feature, { newFeature: true }, true);
      geometry = new OlGeoJSON().writeGeometryObject(olGeometry, {
        featureProjection: projection,
        dataProjection: 'EPSG:4326'
      }) as any;

      feature.geometry = geometry;
    } else {
      workspace.entityStore.state.update(feature, { edit: true }, true);
    }

    feature.projection = 'EPSG:4326';

    const featureOl = featureToOl(feature, projection.getCode());

    this.olDrawingLayer.dataSource.ol.clear();
    this.olDrawingLayer.dataSource.ol.addFeature(featureOl);
    this.map.addLayer(this.olDrawingLayer);

    this.deactivateDrawControl();
    this.createModifyInteraction(featureOl, feature, workspace);
  }

  /**
   * Delete drawings layer and source from the map AND feature from the entity store.
   * Layer refresh will automatically add the new feature into the store.
   */
  deleteDrawings() {
    this.map.removeLayer(this.olDrawingLayer);
    this.olDrawingLayerSource.clear();
    this.map.ol.removeInteraction(this.modify);
  }

  /**
   * Create a modify interaction to allow a geometry change one feature at the time (drag and drop)
   */
  createModifyInteraction(
    olFeature: OlFeature<OlGeometry>,
    feature,
    workspace: EditionWorkspace
  ) {
    this.map.ol.removeInteraction(this.modify);
    const olCollection = new Collection([olFeature], { unique: true });
    this.modify = new OlModify({
      features: olCollection
    });

    this.map.ol.addInteraction(this.modify);
    olCollection.forEach((feature) => {
      feature.setStyle(this.modifyStyle);
    });

    this.modify.on('modifyend', (event) => {
      const olGeometry = event.features.getArray()[0]?.getGeometry();
      if (olGeometry) {
        this.addFeatureToStore(feature, workspace, olGeometry);
      }
    });
  }
}
