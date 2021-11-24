import { MatDialog } from '@angular/material/dialog';
import {
  Workspace,
  WorkspaceOptions
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
  public geometryType = GeometryType; // Reference to the GeometryType enum

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
              const columnName = column.name.slice(11);
              if (columnName === property && column.primary === true) {
                id = feature.properties[property];
              }
            }
          }
          if (url) {
            url += id;
            this.editionWorkspaceService.deleteFeature(feature, workspace, url);
          }
        }
      });
    }, 250);
  }

  editFeature(feature, workspace) {
    feature.edition = true;
    let id;
    outerloop: for (const column of workspace.meta.tableTemplate.columns ) {
      for (const property in feature.properties) {
        const columnName = column.name.slice(11);
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
      feature.newFeature = true;
      const geometryType = workspace.layer.dataSource.options.edition.geomType;
      this.onGeometryTypeChange(geometryType, feature, workspace);
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
      workspace.layer.map.viewController.zoomToExtent(olGeometry.getExtent());
      this.onDrawEnd(olGeometry, feature, workspace);
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
   * Clear the draw source and track the geometry being draw
   * @param olGeometry Ol linestring or polygon
   */
  private onDrawEnd(olGeometry: OlGeometry, feature?, workspace?) {
    this.addFeatureToStore(olGeometry, feature, workspace);
  }

  /**
   * Add a feature with draw label to the store. The loading stragegy of the store
   * will trigger and add the feature to the map.
   * @internal
   */
  private addFeatureToStore(olGeometry, feature?, workspace?) {
    const projection = this.map.ol.getView().getProjection();

    const geometry = new OlGeoJSON().writeGeometryObject(olGeometry, {
      featureProjection: projection,
      dataProjection: 'EPSG:4326'
    }) as any;

    feature.geometry = geometry;
    feature.projection = 'EPSG:4326';

    const featureOl = featureToOl(feature, projection.getCode());

    workspace.layer.dataSource.ol.addFeature(featureOl);

    setTimeout(() => {
      let element = document.getElementsByClassName('edition-table')[0].getElementsByTagName('tbody')[0]
        .lastElementChild.lastElementChild.firstElementChild.firstElementChild as HTMLElement;
      element.click();
      this.deactivateDrawControl();
    }, 500);
  }

  deleteDrawings(feature, workspace) {
    workspace.layer.dataSource.ol.removeFeature(feature.ol);
    workspace.entityStore.delete(feature);
    this.olDrawingLayerSource.clear();
  }
}
