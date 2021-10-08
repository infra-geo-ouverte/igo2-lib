import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  Output
} from '@angular/core';

import {
    FEATURE,
    FeatureStore,
    FeatureStoreSelectionStrategy,
    tryBindStoreLayer,
    tryAddLoadingStrategy,
    tryAddSelectionStrategy,
    FeatureMotion,
    FeatureStoreLoadingStrategy
  } from '../../feature';

import { LanguageService } from '@igo2/core';
import { MatDialog } from '@angular/material/dialog';
import { GeometryType } from '../shared/draw.enum';
import { IgoMap } from '../../map/shared/map';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Draw, FeatureWithDraw } from '../shared/draw.interface';
import { FormGroup, FormBuilder } from '@angular/forms';
import { VectorSourceEvent as OlVectorSourceEvent } from 'ol/source/Vector';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { DrawControl } from '../../geometry/shared/controls/draw';
import { EntityRecord, EntityTableTemplate } from '@igo2/common';

import * as OlStyle from 'ol/style';
import OlVectorSource from 'ol/source/Vector';
import OlCircle from 'ol/geom/Circle';
import OlPoint from 'ol/geom/Point';
import OlFeature from 'ol/Feature';
import OlGeoJSON from 'ol/format/GeoJSON';
import OlOverlay from 'ol/Overlay';
import type { default as OlGeometryType } from 'ol/geom/GeometryType';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import { getDistance } from 'ol/sphere';
import { DrawStyleService } from '../shared/draw-style.service';
import { skip } from 'rxjs/operators';
import { DrawPopupComponent } from './draw-popup.component';
import { DrawShorcutsComponent } from './draw-shorcuts.component';
import { getTooltipsOfOlGeometry } from '../../measure/shared/measure.utils';
import { createInteractionStyle } from '../shared/draw.utils';
import { transform } from 'ol/proj';
import { DrawIconService } from '../shared/draw-icon.service';

@Component ({
  selector: 'igo-draw',
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DrawComponent implements OnInit, OnDestroy {
  /**
   * Table template
   * @internal
   */
  public tableTemplate: EntityTableTemplate = {
    selection: true,
    selectMany: true,
    selectionCheckbox: true,
    sort: true,
    columns: [{
      name: 'Drawing',
      title: this.languageService.translate.instant('igo.geo.draw.labels'),
      valueAccessor: (feature: FeatureWithDraw) => {
        return feature.properties.draw;
      }
    }]
  };

  public geometryType = GeometryType; // Reference to the GeometryType enum

  @Output() fillColor: string;
  @Output() strokeColor: string;
  @Output() strokeWidth: number;

  @Input() map: IgoMap; // Map to draw on

  @Input() store: FeatureStore<FeatureWithDraw>; // Drawing store

  public draw$: BehaviorSubject<Draw> = new BehaviorSubject({}); // Observable of draw

  private olDrawingLayerSource = new OlVectorSource();
  private drawControl: DrawControl;
  private drawEnd$$: Subscription;
  private drawSelect$$: Subscription;
  private olDrawingLayer: VectorLayer;
  public selectedFeatures$: BehaviorSubject<FeatureWithDraw[]> = new BehaviorSubject([]);
  public fillForm: string;
  public strokeForm: string;
  public drawControlIsDisabled: boolean = true;
  public drawControlIsActive: boolean = false;
  public labelsAreShown: boolean;
  private subscriptions$$: Subscription[] = [];

  public position: string = 'bottom';
  public form: FormGroup;
  public icons: Array<string>;
  public icon: string;

  constructor(
    private languageService: LanguageService,
    private formBuilder: FormBuilder,
    private drawStyleService: DrawStyleService,
    private dialog: MatDialog,
    private drawIconService: DrawIconService
  ) {
    this.buildForm();
    this.fillColor = this.drawStyleService.getFillColor();
    this.strokeColor = this.drawStyleService.getStrokeColor();
    this.strokeWidth = this.drawStyleService.getStrokeWidth();
    this.labelsAreShown = this.drawStyleService.getLabelsAreShown();
    this.icons = this.drawIconService.getIcons();
    this.icon = this.drawStyleService.getIcon();
  }

  // Initialize the store that will contain the entities and create the Draw control
  ngOnInit() {
    this.initStore();
    this.drawControl = this.createDrawControl(this.fillColor, this.strokeColor, this.strokeWidth);
  }

  /**
   * Remove the drawing layer and the interactions
   * @internal
   */
  ngOnDestroy() {
    this.drawControl.setOlMap(undefined);
    this.subscriptions$$.map(s => s.unsubscribe());
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
  onGeometryTypeChange(geometryType: typeof OlGeometryType) {
    this.drawControl.setGeometryType(geometryType);
    this.toggleDrawControl();
  }

  /**
   * Store initialization, including drawing layer creation
   */
  private initStore() {
    this.map.removeLayer(this.olDrawingLayer);

    this.olDrawingLayer = new VectorLayer({
      id: 'igo-draw-layer',
      title: this.languageService.translate.instant('igo.geo.draw.drawing'),
      zIndex: 200,
      source: new FeatureDataSource(),
      style: (feature, resolution) => {
        return this.drawStyleService.createDrawingLayerStyle(feature, resolution, this.labelsAreShown, this.icon);
      },
      showInLayerList: true,
      exportable: true,
      browsable: false,
      workspace: {
        enabled: false
      },
    });
    tryBindStoreLayer(this.store, this.olDrawingLayer);

    tryAddLoadingStrategy(this.store, new FeatureStoreLoadingStrategy({
      motion: FeatureMotion.None
    }));

    tryAddSelectionStrategy(this.store, new FeatureStoreSelectionStrategy({
      map: this.map,
      motion: FeatureMotion.None,
      many: true
    }));
    this.store.layer.visible = true;
    this.store.source.ol.on('removefeature', (event: OlVectorSourceEvent<OlGeometry>) => {
      const olGeometry = event.feature.getGeometry();
      this.clearLabelsOfOlGeometry(olGeometry);
    });

    this.subscriptions$$.push(this.store.stateView.manyBy$((record: EntityRecord<FeatureWithDraw>) => {
      return record.state.selected === true;
    }).pipe(
      skip(1) // Skip initial emission
    ).subscribe((records: EntityRecord<FeatureWithDraw>[]) => {
      this.selectedFeatures$.next(records.map(record => record.entity));
    }));

    this.subscriptions$$.push(this.store.count$.subscribe(cnt => {
      cnt >= 1 ? this.store.layer.options.showInLayerList = true : this.store.layer.options.showInLayerList = false;
    }));
  }

  /**
   * Called when the user changes the color in a color picker
   * @param labelsAreShown wheter the labels are shown or not
   * @param isAnIcon wheter the feature is an icon or not
   */
  onColorChange(labelsAreShown: boolean, isAnIcon: boolean) {
    this.fillForm = this.fillColor;
    this.strokeForm = this.strokeColor;
    this.drawStyleService.setFillColor(this.fillColor);
    this.drawStyleService.setStrokeColor(this.strokeColor);

    if (isAnIcon) {
      this.store.layer.ol.setStyle((feature, resolution) => {
        return this.drawStyleService.createDrawingLayerStyle(feature, resolution, labelsAreShown, this.icon);
      });
      this.icon = undefined;

    } else {
      this.store.layer.ol.setStyle((feature, resolution) => {
        return this.drawStyleService.createDrawingLayerStyle(feature, resolution, labelsAreShown);
      });
    }
    this.createDrawControl();
  }

  /**
   * Called when the user toggles the Draw control is toggled
   * @internal
   */
  onToggleDrawControl(toggleIsChecked: boolean) {
    toggleIsChecked ? this.toggleDrawControl() : this.deactivateDrawControl();
  }

  /**
   * Activate the correct control
   */
  private toggleDrawControl() {
    this.deactivateDrawControl();
    this.activateDrawControl();
  }

  /**
   * Open a dialog box to enter label and do something
   * @param olGeometry geometry at draw end or selected geometry
   * @param drawEnd event fired at drawEnd?
   */
  private openDialog(olGeometryFeature, isDrawEnd: boolean) {
    setTimeout(() => {
      // open the dialog box used to enter label
      const dialogRef = this.dialog.open(DrawPopupComponent, {
        disableClose: false,
        data: {currentLabel: olGeometryFeature.get('draw')}
      });

      // when dialog box is closed, get label and set it to geometry
      dialogRef.afterClosed().subscribe((label: string) => {
        this.updateLabelOfOlGeometry(olGeometryFeature, label);

        // if event was fired at draw end
        if (isDrawEnd) {
          this.onDrawEnd(olGeometryFeature);

        // if event was fired at select
        } else {
          this.onSelectDraw(olGeometryFeature, label);
        }
      });
    }, 250);
  }

  /**
   * Activate a given control
   */
  private activateDrawControl() {
    this.drawControlIsDisabled = false;
    this.drawControlIsActive = true;
    this.drawEnd$$ = this.drawControl.end$.subscribe((olGeometry: OlGeometry) => {
      this.openDialog(olGeometry, true);
    });

    this.drawControl.modify$.subscribe((olGeometry: OlGeometry) => {
      this.onModifyDraw(olGeometry);
    });

    if (!this.drawSelect$$) {
      this.drawSelect$$ = this.drawControl.select$.subscribe((olFeature: OlFeature<OlGeometry>) => {
        this.openDialog(olFeature, false);
      });
    }

    this.drawControl.setOlMap(this.map.ol, true);
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

  /**
   * Clear the draw source and track the geometry being draw
   * @param olGeometry Ol linestring or polygon
   */
  private onDrawEnd(olGeometry: OlGeometry, radius?: number) {
    this.addFeatureToStore(olGeometry, radius);
    this.clearLabelsOfOlGeometry(olGeometry);
    this.store.layer.ol.getSource().refresh();
  }

  private onModifyDraw(olGeometry) {
    const entities = this.store.all();

    entities.forEach(entity => {
      const entityId = entity.properties.id;

      const olGeometryId = olGeometry.ol_uid;

      if (entityId === olGeometryId) {
        this.updateLabelOfOlGeometry(olGeometry, entity.properties.draw);
        this.replaceFeatureInStore(entity, olGeometry);
      }
    });
  }

  private onSelectDraw(olFeature: OlFeature<OlGeometry>, label: string) {
    const entities = this.store.all();

    const olGeometry = olFeature.getGeometry() as any;
    olGeometry.ol_uid = olFeature.get('id');

    const olGeometryCoordinates = JSON.stringify(olGeometry.getCoordinates()[0]);

    entities.forEach(entity => {
      const entityCoordinates = JSON.stringify(entity.geometry.coordinates[0]);

      if (olGeometryCoordinates === entityCoordinates) {
        const rad: number = entity.properties.rad ? entity.properties.rad : undefined;

        this.updateLabelOfOlGeometry(olGeometry, label);
        this.replaceFeatureInStore(entity, olGeometry, rad);
      }
    });
  }

  /**
   * Add a feature with draw label to the store. The loading stragegy of the store
   * will trigger and add the feature to the map.
   * @internal
   */
  private addFeatureToStore(olGeometry, radius?: number, feature?: FeatureWithDraw) {
    let rad: number;
    let center4326: Array<number>;
    let point4326: Array<number>;
    let lon4326: number;
    let lat4326: number;
    const featureId = feature ? feature.properties.id : olGeometry.ol_uid;
    const projection = this.map.ol.getView().getProjection();

    const geometry = new OlGeoJSON().writeGeometryObject(olGeometry, {
      featureProjection: projection,
      dataProjection: projection
    }) as any;

    if (olGeometry instanceof OlCircle || radius) {
      if (radius) {
        rad = radius;
      } else {
        geometry.type = 'Point';
        geometry.coordinates = olGeometry.getCenter();
        const extent4326 = transform([olGeometry.getFlatCoordinates()[2], olGeometry.getFlatCoordinates()[3]], projection, 'EPSG:4326');
        center4326 = transform([olGeometry.getFlatCoordinates()[0], olGeometry.getFlatCoordinates()[1]], projection, 'EPSG:4326');
        lon4326 = center4326[0];
        lat4326 = center4326[1];
        rad = getDistance(center4326, extent4326);
      }
    }

    if (olGeometry instanceof OlPoint) {
      point4326 = transform(olGeometry.getFlatCoordinates(), projection, 'EPSG:4326');
      lon4326 = point4326[0];
      lat4326 = point4326[1];
    }

    this.store.update({
      type: FEATURE,
      geometry,
      projection: projection.getCode(),
      properties: {
        id: featureId,
        draw: olGeometry.get('_label'),
        longitude: lon4326 ? lon4326 : null,
        latitude: lat4326 ? lat4326 : null,
        rad: rad ? rad : null
      },
      meta: {
       id: featureId
      }
    });
  }

  /**
   * Replace the feature in the store
   * @param entity the entity to replace
   * @param olGeometry the new geometry to insert in the store
   */
  private replaceFeatureInStore(entity, olGeometry: OlGeometry, radius?: number) {
    this.store.delete(entity);
    this.onDrawEnd(olGeometry, radius);
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      fill: [''],
      stroke: ['']
    });
  }

  deleteDrawings() {
    this.store.deleteMany(this.selectedFeatures$.value);
    this.selectedFeatures$.value.forEach(selectedFeature => {
      this.olDrawingLayerSource.getFeatures().forEach(drawingLayerFeature => {
        const geometry = drawingLayerFeature.getGeometry() as any;
        if (selectedFeature.properties.id === geometry.ol_uid) {
          this.olDrawingLayerSource.removeFeature(drawingLayerFeature);
        }
      });
    });
  }

  /**
   * Clear the tooltips of an OL geometry
   * @param olGeometry OL geometry with tooltips
   */
  private clearLabelsOfOlGeometry(olGeometry) {
    getTooltipsOfOlGeometry(olGeometry).forEach((olTooltip: OlOverlay | undefined) => {
      if (olTooltip && olTooltip.getMap()) {
        this.map.ol.removeOverlay(olTooltip);
      }
    });
  }

  /**
   * Called when the user toggles the labels toggle
   */
  onToggleLabels() {
    this.drawStyleService.toggleLabelsAreShown();
    this.labelsAreShown = !this.labelsAreShown;
    this.icon ? this.onColorChange(this.labelsAreShown, true) : this.onColorChange(this.labelsAreShown, false);
    }

  /**
   * Update the label of a geometry when a label is entered in a dialog box
   * @param olGeometry the geometry
   * @param label the label
   */
  private updateLabelOfOlGeometry(olGeometry: OlGeometry, label: string) {
    olGeometry.setProperties({
      _label: label
    }, true);
  }

  onIconChange(event?) {
    this.icon = event;
    this.drawStyleService.setIcon(this.icon);
    this.store.layer.ol.setStyle((feature, resolution) => {
      return this.drawStyleService.createDrawingLayerStyle(feature, resolution, true, this.icon);
    });
  }

  openShorcutsDialog() {
    this.dialog.open(DrawShorcutsComponent);
  }
}
