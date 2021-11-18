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
import { FEATURE } from '../../feature';

import type { default as OlGeometryType } from 'ol/geom/GeometryType';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import { transform } from 'ol/proj';
import OlPoint from 'ol/geom/Point';
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
  public drawControlIsActive: boolean = false;
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
      })
    }, 250)
  }

  editFeature(feature, workspace) {
    feature.edition = true;
  
    console.log('edition', feature);
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
      workspace.entityStore.state.update(feature, { selected: true });
    } else {
      feature.new = true;
      const geometryType = workspace.entityStore.entities$.getValue()[0].geometry.type;
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
    this.drawControlIsActive = false;
  }

  private getInResolutionRange(): boolean {
    return this.inResolutionRange$.value;
  }

  /**
   * Activate a given control
   */
   private activateDrawControl(feature, workspace) {
    this.drawControlIsActive = true;
    this.drawEnd$$ = this.drawControl.end$.subscribe((olGeometry: OlGeometry) => {
      this.onDrawEnd(olGeometry, feature, workspace);
    });

    this.drawControl.modify$.subscribe((olGeometry: OlGeometry) => {
      //this.onModifyDraw(olGeometry);
    });

    this.drawControl.setOlMap(this.map.ol, true);
  }

  // private onModifyDraw(olGeometry) {
  //   const primaryColumn = this.options.meta.tableTemplate.columns.find(col => col.primary === true);
  //   let primaryField;
  //   if (primaryColumn.name.includes('properties.')) {
  //     primaryField = primaryColumn.name.slice(11);
  //   } else {
  //     primaryField = primaryColumn.name;
  //   }

  //   const entities = this.options.entityStore.all();

  //   entities.forEach(entity => {
  //     const entityId = entity.properties[primaryField];

  //     const olGeometryId = olGeometry.ol_uid;

  //     if (entityId === olGeometryId) {
  //       this.replaceFeatureInStore(entity, olGeometry);
  //     }
  //   });
  // }

  /**
   * Replace the feature in the store
   * @param entity the entity to replace
   * @param olGeometry the new geometry to insert in the store
   */
    //  private replaceFeatureInStore(entity, olGeometry: OlGeometry) {
    //   this.options.entityStore.delete(entity);
    //   this.onDrawEnd(olGeometry);
    // }

  /**
   * Clear the draw source and track the geometry being draw
   * @param olGeometry Ol linestring or polygon
   */
  private onDrawEnd(olGeometry: OlGeometry, feature?, workspace?) {
    this.addFeatureToStore(olGeometry, feature, workspace);
    this.options.layer.dataSource.ol.refresh();
  }

  /**
   * Add a feature with draw label to the store. The loading stragegy of the store
   * will trigger and add the feature to the map.
   * @internal
   */
  private addFeatureToStore(olGeometry, feature?, workspace?) {
  let point4326: Array<number>;
  const projection = this.map.ol.getView().getProjection();

  const geometry = new OlGeoJSON().writeGeometryObject(olGeometry, {
    featureProjection: projection,
    dataProjection: projection
  }) as any;
  let featureGeometry;

  if (olGeometry instanceof OlPoint) {
    point4326 = transform(olGeometry.getFlatCoordinates(), projection, 'EPSG:4326');
    featureGeometry = {
      type: 'Point',
      coordinates: [point4326[0], point4326[1]]
    };
  }

  featureGeometry ? feature.geometry = featureGeometry : feature.geometry = geometry;
  feature.projection = 'EPSG:4326';

  this.deactivateDrawControl();
  console.log('feature', feature);
  workspace.entityStore.insert(feature);
  workspace.entityStore.state.update(feature, { selected: true });
  console.log(workspace.entityStore.all());
  // setTimeout(() => {
  //   let element = document.getElementsByClassName('edition-table')[0].getElementsByTagName('tbody')[0]
  //     .lastElementChild.lastElementChild.firstElementChild.firstElementChild as HTMLElement;
  //   console.log(element);
  //   element.click();
  // }, 500);
}
}
