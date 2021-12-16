import { MatDialog } from '@angular/material/dialog';
import {
  Workspace,
  WorkspaceOptions,
  EntityRecord
} from '@igo2/common';
import { ConfigService } from '@igo2/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { ImageLayer, VectorLayer } from '../../layer';
import { IgoMap } from '../../map';
import { EditionWorkspaceService } from './edition-workspace.service';
import { ConfirmationPopupComponent } from '../confirmation-popup/confirmation-popup.component';
import { DrawControl } from '../../geometry';
import { createInteractionStyle, GeometryType } from '../../draw';
import { featureToOl } from '../../feature';

import type { default as OlGeometryType } from 'ol/geom/GeometryType';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import OlGeoJSON from 'ol/format/GeoJSON';
import OlVectorSource from 'ol/source/Vector';
import * as OlStyle from 'ol/style';
import { FeatureDataSource } from '../../datasource/shared';

export interface EditionWorkspaceOptions extends WorkspaceOptions {
  layer: ImageLayer | VectorLayer;
  map: IgoMap;
}

export class EditionWorkspace extends Workspace {

  readonly inResolutionRange$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  get layer(): ImageLayer | VectorLayer { return this.options.layer; }

  get map(): IgoMap { return this.options.map; }

  private drawControl: DrawControl;
  private drawEnd$$: Subscription;
  private olDrawingLayerSource = new OlVectorSource();
  private olDrawingLayer: VectorLayer;
  public geometryType = GeometryType; // Reference to the GeometryType enum

  private filterClauseFunc = (record: EntityRecord<object>) => {
    return record.state.newFeature === true;
  };

  fillColor: string;
  strokeColor: string;
  strokeWidth: number;

  constructor(
    protected options: EditionWorkspaceOptions,
    private editionWorkspaceService: EditionWorkspaceService,
    private dialog: MatDialog,
    private configService: ConfigService) {
    super(options);
    this.map.viewController.resolution$.subscribe((mapResolution) => {
      if (mapResolution > this.layer.minResolution && mapResolution < this.layer.maxResolution) {
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
      },
    });
  }

  private getInResolutionRange(): boolean {
    return this.inResolutionRange$.value;
  }

  deleteFeature(feature, workspace) {
    setTimeout(() => {
      const dialogRef = this.dialog.open(ConfirmationPopupComponent, {
        disableClose: false,
        data: {type: 'delete'}
    });

      dialogRef.afterClosed().subscribe(result => {
        if (result === false) {
          let id;
          let url =
            this.configService.getConfig('edition.url') +
            workspace.layer.dataSource.options.edition.baseUrl + '?' +
            workspace.layer.dataSource.options.edition.deleteUrl;
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
            this.editionWorkspaceService.deleteFeature(workspace, url);
          }
        }
      });
    }, 250);
  }

  editFeature(feature, workspace: EditionWorkspace) {
    feature.edition = true;
    let id;
    const editionOpt = workspace.layer.dataSource.options.edition;
    outerloop: for (const column of workspace.meta.tableTemplate.columns ) {
      for (const property in feature.properties) {
        let columnName = column.name;
        if (columnName.includes('properties.')) {
          columnName = columnName.split('.')[1];
        }
        if (columnName === property && column.primary === true) {
          id = feature.properties[property];
          break outerloop;
        }
      }
    }
    if (id) {
      feature.original_properties = JSON.parse(JSON.stringify(feature.properties));
      feature.idkey = id;
    } else {
      // Only for edition with it's own geometry
      if (!feature.newFeature && editionOpt.geomType) {
        feature.newFeature = true;
        workspace.entityStore.state.updateAll({ newFeature: false });
        workspace.entityStore.stateView.filter(this.filterClauseFunc);
        if (editionOpt.addWithDraw) {
          const geometryType = editionOpt.geomType;
          this.onGeometryTypeChange(geometryType, feature, workspace);
        } else {
          workspace.entityStore.insert(feature);
          workspace.entityStore.state.update(feature, { newFeature: true }, true);
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
  createDrawControl(fillColor?: string, strokeColor?: string, strokeWidth?: number) {
    const drawControl = new DrawControl({
      geometryType: undefined,
      drawingLayerSource: this.olDrawingLayerSource,
      drawingLayerStyle: new OlStyle.Style({}),
      interactionStyle: createInteractionStyle(fillColor, strokeColor, strokeWidth),
    });

    return drawControl;
  }

  /**
   * Called when the user selects a new geometry type
   * @param geometryType the geometry type selected by the user
   */
  onGeometryTypeChange(geometryType: typeof OlGeometryType, feature, workspace) {
      this.drawControl.setGeometryType(geometryType);
      this.toggleDrawControl(feature, workspace);
    }

  /**
   * Activate the correct control
   */
  private toggleDrawControl(feature, workspace) {
    this.deactivateDrawControl();
    this.activateDrawControl(feature, workspace);
  }

  /**
   * Deactivate the active draw control
   */
  private deactivateDrawControl() {
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
  private activateDrawControl(feature, workspace) {
    this.drawEnd$$ = this.drawControl.end$.subscribe((olGeometry: OlGeometry) => {
      this.addFeatureToStore(olGeometry, feature, workspace);
    });

    // this.drawControl.modify$.subscribe((olGeometry: OlGeometry) => {
    //   this.onModifyDraw(olGeometry, workspace);
    // });

    this.drawControl.setOlMap(this.map.ol, true);
  }

  // private onModifyDraw(olGeometry, workspace) {
  //   console.log('onModify');
  //   const primaryColumn = workspace.options.meta.tableTemplate.columns.find(col => col.primary === true);
  //   let primaryField;
  //   if (primaryColumn.name.includes('properties.')) {
  //     primaryField = primaryColumn.name.slice(11);
  //   } else {
  //     primaryField = primaryColumn.name;
  //   }

  //   const entities = workspace.options.entityStore.all();

  //   entities.forEach(entity => {
  //     const entityId = entity.properties[primaryField];

  //     const olGeometryId = olGeometry.ol_uid;
  //     console.log(entityId);
  //     console.log(olGeometryId);
  //     if (entityId === olGeometryId) {
  //       this.replaceFeatureInStore(entity, olGeometry, workspace);
  //     }
  //   });
  // }

  /**
   * Replace the feature in the store
   * @param entity the entity to replace
   * @param olGeometry the new geometry to insert in the store
   */
  // private replaceFeatureInStore(entity, olGeometry: OlGeometry, workspace) {
  //     workspace.options.entityStore.delete(entity);
  //     this.onDrawEnd(olGeometry);
  //   }

  /**
   * Add a feature to layer. The loading strategy of the layer
   * will trigger and add the feature to the workspace store.
   * @internal
   */
  private addFeatureToStore(olGeometry, feature?, workspace?) {
    workspace.entityStore.insert(feature);
    workspace.entityStore.state.update(feature, { newFeature: true }, true);
    const projection = this.map.ol.getView().getProjection();

    const geometry = new OlGeoJSON().writeGeometryObject(olGeometry, {
      featureProjection: projection,
      dataProjection: 'EPSG:4326'
    }) as any;

    feature.geometry = geometry;
    feature.projection = 'EPSG:4326';

    const featureOl = featureToOl(feature, projection.getCode());

    this.olDrawingLayer.dataSource.ol.clear();
    this.olDrawingLayer.dataSource.ol.addFeature(featureOl);
    this.map.addLayer(this.olDrawingLayer);

    this.deactivateDrawControl();
  }

  deleteDrawings(feature, workspace) {
    this.map.removeLayer(this.olDrawingLayer);
    this.olDrawingLayerSource.clear();
    workspace.entityStore.delete(feature);
  }
}
