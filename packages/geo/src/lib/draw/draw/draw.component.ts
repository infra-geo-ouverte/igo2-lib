import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  Output,
  EventEmitter
} from '@angular/core';

import {
  FEATURE,
  FeatureStore,
  FeatureStoreSelectionStrategy,
  tryBindStoreLayer,
  tryAddLoadingStrategy,
  tryAddSelectionStrategy,
  FeatureMotion,
  FeatureStoreLoadingStrategy,
  featureToOl
} from '../../feature';

import { LanguageService } from '@igo2/core';
import { MatDialog } from '@angular/material/dialog';
import { FontType, GeometryType } from '../shared/draw.enum';
import { IgoMap } from '../../map/shared/map';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Draw, FeatureWithDraw, StoreAndDrawControl } from '../shared/draw.interface';
import { FormGroup, FormBuilder } from '@angular/forms';
import { VectorSourceEvent as OlVectorSourceEvent } from 'ol/source/Vector';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { DrawControl } from '../../geometry/shared/controls/draw';
import {
  EntityRecord,
  EntityTableTemplate
} from '@igo2/common';

import * as OlStyle from 'ol/style';
import OlVectorSource from 'ol/source/Vector';
import OlCircle from 'ol/geom/Circle';
import OlPoint from 'ol/geom/Point';
import OlFeature from 'ol/Feature';
import OlGeoJSON from 'ol/format/GeoJSON';
import OlOverlay from 'ol/Overlay';
import type { default as OlGeometryType } from 'ol/geom/GeometryType';
import { default as OlGeometry } from 'ol/geom/Geometry';
import { getDistance } from 'ol/sphere';
import { DrawStyleService } from '../shared/draw-style.service';
import { skip } from 'rxjs/operators';
import { DrawPopupComponent } from './draw-popup.component';
import { DrawShorcutsComponent } from './draw-shorcuts.component';
import { getTooltipsOfOlGeometry } from '../../measure/shared/measure.utils';
import { createInteractionStyle } from '../shared/draw.utils';
import { transform } from 'ol/proj';
import { DrawIconService } from '../shared/draw-icon.service';

import {
  trigger,
  state,
  style,
  animate,
  transition
  // ...
} from '@angular/animations';
import Point from 'ol/geom/Point';
import { DrawLayerPopupComponent } from './draw-layer-popup.component';

@Component({
  selector: 'igo-draw',
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          opacity: 1
        })
      ),
      state(
        'closed',
        style({
          opacity: 0
        })
      ),
      transition('open => closed', [animate('600ms ease')]),
      transition('closed => open', [animate('800ms ease')])
    ])
  ],
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
    fixedHeader: true,
    tableHeight: 'auto',
    columns: [
      {
        name: 'Drawing',
        title: this.languageService.translate.instant('igo.geo.draw.labels'),
        valueAccessor: (feature: FeatureWithDraw) => {
          return feature.properties.draw;
        }
      }
    ]
  };

  public geometryType = GeometryType; // Reference to the GeometryType enum

  @Output() fillColor: string;
  @Output() strokeColor: string;
  @Output() strokeWidth: number;

  @Output() fontSize: string;
  @Output() fontStyle: string;
  @Input() map: IgoMap; // Map to draw on
  @Input()
  get stores(): FeatureStore<FeatureWithDraw>[] {
    return this._stores;
  }
  set stores(stores: FeatureStore<FeatureWithDraw>[]) {
    this._stores = stores;
  }
  private _stores;
  @Output() storesChange = new EventEmitter<FeatureStore<FeatureWithDraw>[]>();

  @Input()
  get drawControls(): [string, DrawControl][]{
    return this._drawControls;
  }
  set drawControls(drawControls:  [string, DrawControl][]){
    this._drawControls = drawControls;
  }
  private _drawControls;
  @Output() drawControlsChange = new EventEmitter<[string, DrawControl][]>();

  private layerWithSAndDC = new Map<string, StoreAndDrawControl>();
  private layerCounterID: number = 0;

  public draw$: BehaviorSubject<Draw> = new BehaviorSubject({}); // Observable of draw

  private activeDrawingLayerSource = new OlVectorSource();
  private drawControl: DrawControl;
  private drawEnd$$: Subscription;
  private drawSelect$$: Subscription;
  private activeDrawingLayer: VectorLayer;
  public selectedFeatures$: BehaviorSubject<FeatureWithDraw[]> =
    new BehaviorSubject([]);
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

  private numberOfDrawings: number;
  public isCreatingNewLayer: boolean = false;
  public activeStore: FeatureStore<FeatureWithDraw>;

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

    this.fontSize = this.drawStyleService.getFontSize();
    this.fontStyle = this.drawStyleService.getFontStyle();
  }

  // Initialize the store that will contain the entities and create the Draw control
  ngOnInit() {

    console.log(this.map);
    console.log(this.stores);
    console.log(this.drawControls);
    
    if(!Array.isArray(this.stores) || !Array.isArray(this.drawControls)){
      this.activeStore = new FeatureStore<FeatureWithDraw>([],{map: this.map})
      this.initStore();
      this.drawControl = this.createDrawControl(
        this.fillColor,
        this.strokeColor,
        this.strokeWidth
      );
      this.drawControl.setGeometryType(this.geometryType.Point as any);
      this.toggleDrawControl();
      this.stores = [];
      this.drawControls = [];      
      this.stores.push(this.activeStore);
      this.drawControls.push([this.activeDrawingLayer.id, this.drawControl]);
      this.storesChange.emit(this.stores);
      this.drawControlsChange.emit(this.drawControls);
      
      this.onLayerChange(this.activeDrawingLayer);
    }
    else{
      this.activeDrawingLayer = this.stores[0].layer;
      this.onLayerChange(this.activeDrawingLayer);
      this.subscriptions$$.push(
        this.activeStore.stateView
          .manyBy$((record: EntityRecord<FeatureWithDraw>) => {
            return record.state.selected === true;
          })
          .pipe(
            skip(1) // Skip initial emission
          )
          .subscribe((records: EntityRecord<FeatureWithDraw>[]) => {
            this.selectedFeatures$.next(records.map((record) => record.entity));
          })
      );
  
      this.subscriptions$$.push(
        this.activeStore.count$.subscribe((cnt) => {
          cnt >= 1
            ? (this.activeStore.layer.options.showInLayerList = true)
            : (this.activeStore.layer.options.showInLayerList = false);
        })
      );
    }
  }

  /**
   * Remove the drawing layer and the interactions
   * @internal
   */
  ngOnDestroy() {
    this.drawControl.setOlMap(undefined);
    this.subscriptions$$.map((s) => s.unsubscribe());
    this.layerWithSAndDC.clear();
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
      drawingLayerSource: this.activeDrawingLayerSource,
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
   * Store initialization, including drawing layer creation
   */

  // Reminder: private
  private initStore(newTitle?: string, isNewLayer?: boolean) {
    // this.map.removeLayer(this.activeDrawingLayer);
    this.createLayer(newTitle, isNewLayer);

    // When changing between layers

    this.subscriptions$$.push(
      this.activeStore.stateView
        .manyBy$((record: EntityRecord<FeatureWithDraw>) => {
          return record.state.selected === true;
        })
        .pipe(
          skip(1) // Skip initial emission
        )
        .subscribe((records: EntityRecord<FeatureWithDraw>[]) => {
          this.selectedFeatures$.next(records.map((record) => record.entity));
        })
    );

    this.subscriptions$$.push(
      this.activeStore.count$.subscribe((cnt) => {
        cnt >= 1
          ? (this.activeStore.layer.options.showInLayerList = true)
          : (this.activeStore.layer.options.showInLayerList = false);
      })
    );
  }

  /**
   * Open a dialog box to enter label and do something
   * @param olGeometry geometry at draw end or selected geometry
   * @param drawEnd event fired at drawEnd?
   */
  private openDialog(olGeometry, isDrawEnd: boolean) {
    setTimeout(() => {
      // open the dialog box used to enter label
      const dialogRef = this.dialog.open(DrawPopupComponent, {
        disableClose: false,
        data: { currentLabel: olGeometry.get('draw') }
      });

      // when dialog box is closed, get label and set it to geometry
      dialogRef.afterClosed().subscribe((label: string) => {
        // checks if the user clicked ok
        if (dialogRef.componentInstance.confirmFlag) {
          this.updateLabelOfOlGeometry(olGeometry, label);
          if (!olGeometry.values_.fontStyle) {
            this.updateFontSizeAndStyle(olGeometry, '20', FontType.Arial);
          }
          if (!olGeometry.values_.drawingStyle) {
            this.updateFillAndStrokeColor(
              olGeometry,
              'rgba(255,255,255,0.4)',
              'rgba(143,7,7,1)'
            );
          }
          if (!(olGeometry.values_.offsetX || olGeometry.values_.offsetY)) {
            this.updateOffset(
              olGeometry,
              0,
              olGeometry instanceof Point ? -15 : 0
            );
          }

          // if event was fired at draw end
          if (isDrawEnd) {
            this.onDrawEnd(olGeometry);
            // if event was fired at select
          } else {
            this.onSelectDraw(olGeometry, label);
          }

          // Activates
          this.updateHeightTable();
        }
        // deletes the feature
        else {
          this.activeDrawingLayerSource
            .getFeatures()
            .forEach((drawingLayerFeature) => {
              const geometry = drawingLayerFeature.getGeometry() as any;
              if (olGeometry === geometry) {
                this.activeDrawingLayerSource.removeFeature(
                  drawingLayerFeature
                );
              }
            });
        }
      });
    }, 250);
  }

  /**
   * Clear the draw source and track the geometry being draw
   * @param olGeometry Ol linestring or polygon
   */
  private onDrawEnd(olGeometry: OlGeometry, radius?: number) {
    this.addFeatureToStore(olGeometry, radius);
    this.clearLabelsOfOlGeometry(olGeometry);
    this.activeStore.layer.ol.getSource().refresh();
  }

  private onModifyDraw(olGeometry) {
    const entities = this.activeStore.all();

    entities.forEach((entity) => {
      const entityId = entity.properties.id;

      const olGeometryId = olGeometry.ol_uid;

      if (entityId === olGeometryId) {
        this.updateLabelOfOlGeometry(olGeometry, entity.properties.draw);
        this.updateFontSizeAndStyle(
          olGeometry,
          entity.properties.fontStyle.split(' ')[0].replace('px', ''),
          entity.properties.fontStyle.substring(
            entity.properties.fontStyle.indexOf(' ') + 1
          )
        );
        this.updateFillAndStrokeColor(
          olGeometry,
          entity.properties.drawingStyle.fill,
          entity.properties.drawingStyle.stroke
        );
        this.updateOffset(
          olGeometry,
          entity.properties.offsetX,
          entity.properties.offsetY
        );
        this.replaceFeatureInStore(entity, olGeometry);
      }
    });
  }

  private onSelectDraw(olFeature: OlFeature<OlGeometry>, label: string) {
    const entities = this.activeStore.all();

    const olGeometry = olFeature.getGeometry() as any;
    olGeometry.ol_uid = olFeature.get('id');

    const olGeometryCoordinates = JSON.stringify(
      olGeometry.getCoordinates()[0]
    );

    entities.forEach((entity) => {
      const entityCoordinates = JSON.stringify(entity.geometry.coordinates[0]);

      if (olGeometryCoordinates === entityCoordinates) {
        const fontSize = olFeature
          .get('fontStyle')
          .split(' ')[0]
          .replace('px', '');
        const fontStyle = olFeature
          .get('fontStyle')
          .substring(olFeature.get('fontStyle').indexOf(' ') + 1);

        const fillColor = olFeature.get('drawingStyle').fill;
        const strokeColor = olFeature.get('drawingStyle').stroke;

        const offsetX = olFeature.get('offsetX');
        const offsetY = olFeature.get('offsetY');

        const rad: number = entity.properties.rad
          ? entity.properties.rad
          : undefined;
        this.updateLabelOfOlGeometry(olGeometry, label);
        this.updateFontSizeAndStyle(olGeometry, fontSize, fontStyle);
        this.updateFillAndStrokeColor(olGeometry, fillColor, strokeColor);
        this.updateOffset(olGeometry, offsetX, offsetY);
        this.replaceFeatureInStore(entity, olGeometry, rad);
      }
    });
  }

  /**
   * Add a feature with draw label to the store. The loading stragegy of the store
   * will trigger and add the feature to the map.
   * @internal
   */
  private addFeatureToStore(
    olGeometry,
    radius?: number,
    feature?: FeatureWithDraw
  ) {
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
        const extent4326 = transform(
          [
            olGeometry.getFlatCoordinates()[2],
            olGeometry.getFlatCoordinates()[3]
          ],
          projection,
          'EPSG:4326'
        );
        center4326 = transform(
          [
            olGeometry.getFlatCoordinates()[0],
            olGeometry.getFlatCoordinates()[1]
          ],
          projection,
          'EPSG:4326'
        );
        lon4326 = center4326[0];
        lat4326 = center4326[1];
        rad = getDistance(center4326, extent4326);
      }
    }

    if (olGeometry instanceof OlPoint) {
      point4326 = transform(
        olGeometry.getFlatCoordinates(),
        projection,
        'EPSG:4326'
      );
      lon4326 = point4326[0];
      lat4326 = point4326[1];
    }

    this.activeStore.update({
      type: FEATURE,
      geometry,
      projection: projection.getCode(),
      properties: {
        id: featureId,
        draw: olGeometry.get('_label'),
        longitude: lon4326 ? lon4326 : null,
        latitude: lat4326 ? lat4326 : null,
        rad: rad ? rad : null,
        fontStyle: olGeometry.get('style_'),
        drawingStyle: {
          fill: olGeometry.get('fillColor_'),
          stroke: olGeometry.get('strokeColor_')
        },
        offsetX: olGeometry.get('offsetX_'),
        offsetY: olGeometry.get('offsetY_')
      },
      meta: {
        id: featureId
      }
    });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      fill: [''],
      stroke: ['']
    });
  }

  public setupLayer(isNewLayer?: boolean) {
    setTimeout(() => {
      // open the dialog box used to enter label
      const dialogRef = this.dialog.open(DrawLayerPopupComponent, {
        disableClose: false,
      });

      // when dialog box is closed, get label and set it to geometry
      dialogRef.afterClosed().subscribe((label: string) => {
        // checks if the user clicked ok
        if (dialogRef.componentInstance.confirmFlag) {
          
          this.activeStore.state.updateAll({selected: false});
          this.activeStore = new FeatureStore<FeatureWithDraw>([], { map: this.map });
          this.activeDrawingLayerSource = new OlVectorSource();
          this.activeDrawingLayer.opacity = 0;
          this.deactivateDrawControl();
          
          this.initStore(label, isNewLayer);
          this.drawControl = this.createDrawControl(
            this.fillColor,
            this.strokeColor,
            this.strokeWidth
          );
          this.drawControl.setGeometryType(this.geometryType.Point as any);
          this.toggleDrawControl();
    
          this.stores.push(this.activeStore);
          this.drawControls.push([this.activeDrawingLayer.id, this.drawControl]);
          this.storesChange.emit(this.stores);
          this.drawControlsChange.emit(this.drawControls);
          this.isCreatingNewLayer = false;
        }
      });
    }, 250);
  }

  // HTML user interactions

  /**
   * Called when the user double-clicks the selected drawing
   */
  editLabelDrawing() {
    if (this.selectedFeatures$.value.length) {
      const olGeometry = featureToOl(
        this.selectedFeatures$.value[0],
        this.map.ol.getView().getProjection().getCode()
      );
      this.openDialog(olGeometry, false);
    }
  }

  openShorcutsDialog() {
    this.dialog.open(DrawShorcutsComponent);
  }

  deleteDrawings() {
    this.activeStore.deleteMany(this.selectedFeatures$.value);
    this.selectedFeatures$.value.forEach((selectedFeature) => {
      this.activeDrawingLayerSource
        .getFeatures()
        .forEach((drawingLayerFeature) => {
          const geometry = drawingLayerFeature.getGeometry() as any;
          if (selectedFeature.properties.id === geometry.ol_uid) {
            this.activeDrawingLayerSource.removeFeature(drawingLayerFeature);
          }
        });
    });
    this.updateHeightTable();
  }

  /**
   * Called when the user toggles the labels toggle
   */
  onToggleLabels() {
    this.drawStyleService.toggleLabelsAreShown();
    this.labelsAreShown = !this.labelsAreShown;
    this.icon
      ? this.onColorChange(
          this.labelsAreShown,
          true,
          this.fillColor,
          this.strokeColor
        )
      : this.onColorChange(
          this.labelsAreShown,
          false,
          this.fillColor,
          this.strokeColor
        );
  }

  /**
   * Called when the user toggles the Draw control is toggled
   * @internal
   */
  onToggleDrawControl(toggleIsChecked: boolean) {
    toggleIsChecked ? this.toggleDrawControl() : this.deactivateDrawControl();
  }

  // User changes properties of a drawing element

  /**
   * Display the current layer with the current store and the current layerSource
   */

  public onLayerChange(currLayer?: VectorLayer, isNewLayer?: boolean) {
    if (currLayer) {
      this.activeStore.state.updateAll({selected: false});
      this.isCreatingNewLayer = false;
      this.activeDrawingLayer.opacity = 0;
      this.activeDrawingLayer = currLayer;
      this.activeDrawingLayer.opacity = 1;

      this.deactivateDrawControl();      
      this.activeStore = this.stores.find(store => store.layer.id === this.activeDrawingLayer.id);
      this.drawControl = this.drawControls.find(dc => dc[0] === this.activeDrawingLayer.id)[1];
      this.activeDrawingLayerSource = this.drawControl.olDrawingLayerSource;
      this.activateDrawControl();
    }
    else {
      this.setupLayer(true);
    }
  }

  public createLayer(newTitle?, isNewLayer?) {
    this.activeDrawingLayer = new VectorLayer({
      isIgoInternalLayer: true,
      id: 'igo-draw-layer' + this.layerCounterID++,
      title: isNewLayer
        ? newTitle
        : this.languageService.translate.instant('igo.geo.draw.drawing'),
      zIndex: 200,
      source: new FeatureDataSource(),
      style: (feature, resolution) => {
        return this.drawStyleService.createIndividualElementStyle(
          feature,
          resolution,
          this.labelsAreShown,
          feature.get('fontStyle'),
          feature.get('drawingStyle').fill,
          feature.get('drawingStyle').stroke,
          feature.get('offsetX'),
          feature.get('offsetY'),
          this.icon
        );
      },
      showInLayerList: true,
      exportable: true,
      browsable: false,
      workspace: {
        enabled: false
      }
    });

    tryBindStoreLayer(this.activeStore, this.activeDrawingLayer);

    tryAddLoadingStrategy(
      this.activeStore,
      new FeatureStoreLoadingStrategy({
        motion: FeatureMotion.None
      })
    );

    tryAddSelectionStrategy(
      this.activeStore,
      new FeatureStoreSelectionStrategy({
        map: this.map,
        motion: FeatureMotion.None,
        many: true
      })
    );
    this.activeStore.layer.visible = true;
    this.activeStore.source.ol.on(
      'removefeature',
      (event: OlVectorSourceEvent<OlGeometry>) => {
        const olGeometry = event.feature.getGeometry();
        this.clearLabelsOfOlGeometry(olGeometry);
      }
    );
  }

  /**
   * Called when the user changes the color in a color picker
   * @param labelsAreShown wheter the labels are shown or not
   * @param isAnIcon wheter the feature is an icon or not
   * @param fillColor which is the filling color
   * @param strokeColor which is the stroke color
   */
  onColorChange(
    labelsAreShown: boolean,
    isAnIcon: boolean,
    fillColor: string,
    strokeColor: string
  ) {
    if (this.selectedFeatures$.value.length > 0) {
      this.selectedFeatures$.value.forEach((feature) => {
        let olFeature = featureToOl(
          feature,
          this.map.ol.getView().getProjection().getCode()
        );
        this.updateFillAndStrokeColor(olFeature, fillColor, strokeColor);

        const entity = this.activeStore
          .all()
          .find((e) => e.meta.id === olFeature.getId());
        entity.properties.drawingStyle.fill = olFeature.get('fillColor_');
        entity.properties.drawingStyle.stroke = olFeature.get('strokeColor_');
        this.activeStore.update(entity);
        this.activeStore.layer.ol.getSource().refresh();
      });
    }
    this.fillColor = fillColor;
    this.strokeColor = strokeColor;

    this.elementStyle(labelsAreShown, isAnIcon);
    if (isAnIcon) {
      this.icon = undefined;
    }
    this.createDrawControl();
  }

  /**
   * Called when the user changes the font size or/and style
   * @param labelsAreShown wheter the labels are shown or not
   * @param size the size of the font
   * @param style the style of the font
   */

  onFontChange(labelsAreShown: boolean, size: string, style: FontType) {
    if (this.selectedFeatures$.value.length > 0) {
      this.selectedFeatures$.value.forEach((feature) => {
        const olFeature = featureToOl(
          feature,
          this.map.ol.getView().getProjection().getCode()
        );
        this.updateFontSizeAndStyle(olFeature, size, style);
        const entity = this.activeStore
          .all()
          .find((e) => e.meta.id === olFeature.getId());
        entity.properties.fontStyle = olFeature.get('style_');
        this.activeStore.update(entity);
        this.activeStore.layer.ol.getSource().refresh();
      });

      this.fontSize = size;
      this.fontStyle = style;

      this.drawStyleService.setFontSize(size);
      this.drawStyleService.setFontStyle(style);

      this.elementStyle(labelsAreShown);
    }
  }

  /**
   * Called when the user changes the value of the horizontal/vertical offset
   * @param labelsAreShown wheter the labels are shown or not
   * @param offsetX horizontal offset of the label
   * @param offsetY vertical offset of the label
   */

  onOffsetLabelChange(
    labelsAreShown: boolean,
    offsetX: number,
    offsetY: number
  ) {
    if (this.selectedFeatures$.value.length > 0) {
      this.selectedFeatures$.value.forEach((feature) => {
        const olFeature = featureToOl(
          feature,
          this.map.ol.getView().getProjection().getCode()
        );
        this.updateOffset(olFeature, offsetX, offsetY);
        const entity = this.activeStore
          .all()
          .find((e) => e.meta.id === olFeature.getId());
        entity.properties.offsetX = olFeature.get('offsetX_');
        entity.properties.offsetY = olFeature.get('offsetY_');
        this.activeStore.update(entity);
        this.activeStore.layer.ol.getSource().refresh();
      });
      this.elementStyle(labelsAreShown);
    }
  }

  onIconChange(event?) {
    this.icon = event;
    this.drawStyleService.setIcon(this.icon);
    this.elementStyle(true, this.icon);
  }

  /**
   * Called when the user selects a new geometry type
   * @param geometryType the geometry type selected by the user
   */
  onGeometryTypeChange(geometryType: typeof OlGeometryType) {
    this.drawControl.setGeometryType(geometryType);
    this.toggleDrawControl();
  }

  // Updates the properties of olFeature inputted

  /**
   * Update the label of a geometry when a label is entered in a dialog box
   * @param olGeometry the geometry
   * @param label the label
   */
  private updateLabelOfOlGeometry(olGeometry: OlGeometry, label: string) {
    olGeometry.setProperties(
      {
        _label: label
      },
      true
    );
  }

  private updateFontSizeAndStyle(
    olFeature: OlFeature<OlGeometry>,
    fontSize: string,
    fontStyle: string
  ) {
    olFeature.setProperties(
      {
        style_: `${fontSize}px ${fontStyle}`
      },
      true
    );
  }

  private updateFillAndStrokeColor(
    olFeature: OlFeature<OlGeometry>,
    fillColor: string,
    strokeColor: string
  ) {
    olFeature.setProperties(
      {
        fillColor_: fillColor,
        strokeColor_: strokeColor
      },
      true
    );
  }

  private updateOffset(
    olFeature: OlFeature<OlGeometry>,
    offsetX: number,
    offsetY: number
  ) {
    olFeature.setProperties(
      {
        offsetX_: offsetX,
        offsetY_: offsetY
      },
      true
    );
  }

  // Updates values of the selected element on the HTML view

  updateFrontendFontSize(): string {
    return this.selectedFeatures$.value.length > 0
      ? this.selectedFeatures$.value[0].properties.fontStyle
          .split(' ')[0]
          .replace('px', '')
      : '20';
  }

  updateFrontendFontStyle() {
    return this.selectedFeatures$.value.length > 0
      ? this.selectedFeatures$.value[0].properties.fontStyle.substring(
          this.selectedFeatures$.value[0].properties.fontStyle.indexOf(' ') + 1
        )
      : FontType.Arial;
  }

  updateFrontendFillColor() {
    return this.selectedFeatures$.value.length > 0
      ? this.selectedFeatures$.value[0].properties.drawingStyle.fill
      : 'rgba(255,255,255,0.4)';
  }

  updateFrontendStrokeColor() {
    return this.selectedFeatures$.value.length > 0
      ? this.selectedFeatures$.value[0].properties.drawingStyle.stroke
      : 'rgba(143,7,7,1)';
  }

  updateFrontendOffsetX() {
    return this.selectedFeatures$.value.length > 0
      ? this.selectedFeatures$.value[0].properties.offsetX
      : this.drawStyleService.getOffsetX();
  }

  updateFrontendOffsetY() {
    return this.selectedFeatures$.value.length > 0
      ? this.selectedFeatures$.value[0].properties.offsetY
      : '0';
  }

  get allFontStyles(): string[] {
    return Object.values(FontType);
  }

  get allLayers() {
    return this.map.layers.filter((layer) =>
      layer.id.includes('igo-draw-layer')
    );
  }

  updateHeightTable() {
    // Check the amount of rows as a possible alternative

    this.numberOfDrawings = this.activeStore.count$.getValue();
    this.numberOfDrawings > 6
      ? (this.tableTemplate.tableHeight = '23vh')
      : (this.tableTemplate.tableHeight = 'auto');
  }

  updateActiveLayer(){
    let currLayer = this.allLayers.find(layer => layer.title === this.activeDrawingLayer.title);
    return currLayer ? currLayer : this.allLayers[0];
  }

  // Helper methods

  /**
   * Activate the correct control
   */
  private toggleDrawControl() {
    this.deactivateDrawControl();
    this.activateDrawControl();
  }

  /**
   * Clear the tooltips of an OL geometry
   * @param olGeometry OL geometry with tooltips
   */
  private clearLabelsOfOlGeometry(olGeometry) {
    getTooltipsOfOlGeometry(olGeometry).forEach(
      (olTooltip: OlOverlay | undefined) => {
        if (olTooltip && olTooltip.getMap()) {
          this.map.ol.removeOverlay(olTooltip);
        }
      }
    );
  }
  /**
   * Replace the feature in the store
   * @param entity the entity to replace
   * @param olGeometry the new geometry to insert in the store
   */
  private replaceFeatureInStore(
    entity,
    olGeometry: OlGeometry,
    radius?: number
  ) {
    this.activeStore.delete(entity);
    this.onDrawEnd(olGeometry, radius);
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
   * Activate a given control
   */
  private activateDrawControl() {
    this.drawControlIsDisabled = false;
    this.drawControlIsActive = true;
    this.drawEnd$$ = this.drawControl.end$.subscribe(
      (olGeometry: OlGeometry) => {
        this.openDialog(olGeometry, true);
      }
    );

    this.drawControl.modify$.subscribe((olGeometry: OlGeometry) => {
      this.onModifyDraw(olGeometry);
    });

    if (!this.drawSelect$$) {
      this.drawSelect$$ = this.drawControl.select$.subscribe(
        (olFeature: OlFeature<OlGeometry>) => {
          this.openDialog(olFeature, false);
        }
      );
    }

    this.drawControl.setOlMap(this.map.ol, true);
  }

  /**
   * Recreates the style of the feature stored
   */
  private elementStyle(labelsAreShown: boolean, isAnIcon?) {
    if (isAnIcon) {
      this.activeStore.layer.ol.setStyle((feature, resolution) => {
        return this.drawStyleService.createIndividualElementStyle(
          feature,
          resolution,
          labelsAreShown,
          feature.get('fontStyle'),
          feature.get('drawingStyle').fill,
          feature.get('drawingStyle').stroke,
          feature.get('offsetX'),
          feature.get('offsetY'),
          this.icon
        );
      });
      // this.icon = undefined;
    } else {
      this.activeStore.layer.ol.setStyle((feature, resolution) => {
        return this.drawStyleService.createIndividualElementStyle(
          feature,
          resolution,
          labelsAreShown,
          feature.get('fontStyle'),
          feature.get('drawingStyle').fill,
          feature.get('drawingStyle').stroke,
          feature.get('offsetX'),
          feature.get('offsetY')
        );
      });
    }
  }
}