import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  input,
  model,
  output,
  viewChild
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup
} from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS,
  MatButtonToggleDefaultOptions,
  MatButtonToggleModule
} from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MatSelect,
  MatSelectChange,
  MatSelectModule
} from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  EntityRecord,
  EntityTableButton,
  EntityTableColumnRenderer,
  EntityTableComponent,
  EntityTableTemplate
} from '@igo2/common/entity';
import { LanguageService } from '@igo2/core/language';
import { IgoLanguageModule } from '@igo2/core/language';

import OlFeature from 'ol/Feature';
import OlOverlay from 'ol/Overlay';
import OlGeoJSON from 'ol/format/GeoJSON';
import OlCircle from 'ol/geom/Circle';
import type { Type } from 'ol/geom/Geometry';
import { default as OlGeometry } from 'ol/geom/Geometry';
import OlPoint from 'ol/geom/Point';
import Polygon, { fromCircle } from 'ol/geom/Polygon';
import * as olproj from 'ol/proj';
import { transform } from 'ol/proj';
import { VectorSourceEvent as OlVectorSourceEvent } from 'ol/source/Vector';
import OlVectorSource from 'ol/source/Vector';
import { getDistance, getLength } from 'ol/sphere';
import * as OlStyle from 'ol/style';

import { BehaviorSubject, Subscription } from 'rxjs';
import { first, skip } from 'rxjs/operators';

import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import {
  FEATURE,
  FeatureMotion,
  FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy,
  featureToOl,
  tryAddLoadingStrategy,
  tryAddSelectionStrategy
} from '../../feature';
import { tryBindStoreLayer } from '../../feature/shared/feature-store.utils';
import { DrawControl } from '../../geometry/shared/controls/draw';
import type { LayerId } from '../../layer/shared';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { IgoMap } from '../../map/shared/map';
import {
  MeasureAreaUnit,
  MeasureAreaUnitAbbreviation,
  MeasureLengthUnit,
  MeasureLengthUnitAbbreviation
} from '../../measure/shared/measure.enum';
import { getTooltipsOfOlGeometry } from '../../measure/shared/measure.utils';
import {
  measureOlGeometryArea,
  measureOlGeometryLength,
  metersToUnit,
  squareMetersToUnit
} from '../../measure/shared/measure.utils';
import { FontType } from '../../style/shared/font.enum';
import { StyleModalDrawingComponent } from '../../style/style-modal/drawing/style-modal-drawing.component';
import { StyleModalData } from '../../style/style-modal/shared/style-modal.interface';
import { DrawStyleService } from '../../style/style-service/draw-style.service';
import { DrawIconService } from '../shared/draw-icon.service';
import { CoordinatesUnit, GeometryType, LabelType } from '../shared/draw.enum';
import { Draw, FeatureWithDraw } from '../shared/draw.interface';
import { DDtoDMS, createInteractionStyle } from '../shared/draw.utils';
import { DrawLayerPopupComponent } from './draw-layer-popup.component';
import { DrawPopupComponent } from './draw-popup.component';
import { DrawShorcutsComponent } from './draw-shorcuts.component';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    MatDividerModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    EntityTableComponent,
    MatBadgeModule,
    AsyncPipe,
    IgoLanguageModule
  ],
  providers: [
    {
      provide: MAT_BUTTON_TOGGLE_DEFAULT_OPTIONS,
      useValue: {
        hideSingleSelectionIndicator: true
      } satisfies MatButtonToggleDefaultOptions
    }
  ]
})
export class DrawComponent implements OnInit, OnDestroy {
  private languageService = inject(LanguageService);
  private formBuilder = inject(UntypedFormBuilder);
  private drawStyleService = inject(DrawStyleService);
  private dialog = inject(MatDialog);
  private drawIconService = inject(DrawIconService);

  /**
   * Table template
   * @internal
   */
  public tableTemplate: EntityTableTemplate;

  public geometryType = GeometryType; // Reference to the GeometryType enum
  readonly map = input<IgoMap>(undefined); // Map to draw on
  readonly stores = model<FeatureStore<FeatureWithDraw>[]>([]);
  readonly drawControls = model<[LayerId, DrawControl][]>([]);
  readonly activeDrawingLayer = model<VectorLayer>();

  readonly activeLayerChange = output<VectorLayer>();
  readonly drawControlsEvent = output<[LayerId, DrawControl][]>();
  readonly layersIDEvent = output<LayerId>();

  fillColor: string;
  strokeColor: string;
  strokeWidth: number;

  fontSize: string;
  fontStyle: string;

  public activeStore: FeatureStore<FeatureWithDraw>;
  private layerCounterID = 0;
  public draw$ = new BehaviorSubject<Draw>({}); // Observable of draw
  private activeDrawingLayerSource = new OlVectorSource();
  private activeDrawControl: DrawControl | undefined;
  private drawEnd$$: Subscription;
  private drawSelect$$: Subscription;
  public selectedFeatures$ = new BehaviorSubject<FeatureWithDraw[]>([]);
  public fillForm: string;
  public strokeForm: string;
  public drawControlIsDisabled = true;
  public drawControlIsActive = false;
  public labelsAreShown: boolean;
  public freehandMode = false;
  private subscriptions$$: Subscription[] = [];

  public position = 'bottom';
  public form: UntypedFormGroup;
  public icons: string[];
  public icon: string;

  public radiusFormControl = new UntypedFormControl(1000);
  public measureUnit: MeasureLengthUnit = MeasureLengthUnit.Meters;
  public radiusFormControlChange$$: Subscription = new Subscription();
  public predefinedRadius$ = new BehaviorSubject<number>(undefined);
  public radiusDrawEnd$ = new BehaviorSubject<number>(undefined);

  /**
   * Available measure units for the measure type given
   * @internal
   */
  get measureUnits(): string[] {
    return [MeasureLengthUnit.Meters, MeasureLengthUnit.Kilometers];
  }
  private numberOfDrawings: number;
  public isCreatingNewLayer = false;
  private currGeometryType = this.geometryType.Point as any;

  readonly select = viewChild<MatSelect>('selectedLayer');

  constructor() {
    this.tableTemplate = {
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
        },
        {
          name: 'Edition',
          title: '',
          sort: false,
          valueAccessor: (feature: FeatureWithDraw) => {
            return [
              {
                editMode: false,
                icon: 'edit',
                color: 'primary',
                click: () => {
                  this.editLabelDrawing(feature);
                },
                style: 'mat-icon-button'
              }
            ] as EntityTableButton[];
          },
          renderer: EntityTableColumnRenderer.ButtonGroup
        }
      ]
    };
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
    if (!this.stores().length) {
      this.activeStore = new FeatureStore<FeatureWithDraw>([], {
        map: this.map()
      });
      this.initStore();
      // is set in the init store
      const drawingLayer = this.activeDrawingLayer();
      this.activeDrawControl = this.createDrawControl(
        this.fillColor,
        this.strokeColor,
        this.strokeWidth
      );
      this.activeDrawControl?.setGeometryType(this.geometryType.Point as any);
      this.toggleDrawControl();
      this.stores.update((stores) => stores.concat(this.activeStore));
      this.drawControls.update((controls) =>
        controls.concat([[drawingLayer?.id, this.activeDrawControl]])
      );
      this.drawControlsEvent.emit(this.drawControls());
      this.layersIDEvent.emit(drawingLayer?.id);
      this.onLayerChange(drawingLayer);
    } else {
      const drawingLayer = this.activeDrawingLayer();
      this.activeStore = this.stores().find(
        (store) => store.layer.id === drawingLayer?.id
      );
      this.activeDrawControl = this.drawControls()?.find(
        (dc) => dc[0] === drawingLayer?.id
      )?.[1];
      this.deactivateDrawControl();
      this.allLayers.forEach((layer) => {
        if (layer.id !== drawingLayer?.id) {
          layer.opacity = 0;
        }
        const store = this.stores().find((s) => s.layer.id === layer.id);

        this.subscriptions$$.push(
          store.stateView
            .manyBy$((record: EntityRecord<FeatureWithDraw>) => {
              return record.state.selected === true;
            })
            .pipe(first())
            .subscribe((records: EntityRecord<FeatureWithDraw>[]) => {
              records.forEach((record) => {
                record.state.selected = false;
              });
            })
        );

        this.subscriptions$$.push(
          store.stateView
            .manyBy$((record: EntityRecord<FeatureWithDraw>) => {
              return record.state.selected === true;
            })
            .pipe(
              skip(1) // Skip initial emission
            )
            .subscribe((records: EntityRecord<FeatureWithDraw>[]) => {
              this.selectedFeatures$.next(
                records.map((record) => record.entity)
              );
            })
        );
      });
      this.onLayerChange(drawingLayer);
    }

    this.radiusFormControlChange$$ =
      this.radiusFormControl.valueChanges.subscribe((value) => {
        if (this.activeDrawControl?.ispredefinedRadius$.getValue()) {
          this.changeRadius(value);
        }
      });
  }

  /**
   * Remove the drawing layer and the interactions
   * @internal
   */
  ngOnDestroy() {
    if (this.activeStore.count === 0) {
      this.activeStore.map.layerController.remove(this.activeDrawingLayer());
    }
    this.allLayers.forEach((layer) => (layer.opacity = 1));
    this.activeStore.state.updateAll({ selected: false });
    this.deactivateDrawControl();
    this.subscriptions$$.map((s) => s.unsubscribe());
    this.radiusFormControlChange$$.unsubscribe();
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
    const activeDrawControl = new DrawControl({
      geometryType: undefined,
      drawingLayerSource: this.activeDrawingLayerSource,
      drawingLayerStyle: new OlStyle.Style({}),
      interactionStyle: createInteractionStyle(
        fillColor,
        strokeColor,
        strokeWidth
      )
    });
    return activeDrawControl;
  }

  /**
   * Store initialization, including drawing layer creation
   */

  private initStore(newTitle?: string, isNewLayer?: boolean) {
    this.createLayer(newTitle, isNewLayer);
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
  }

  /**
   * Open the style modal dialog box
   */
  openStyleModalDialog() {
    setTimeout(() => {
      // open the dialog box used to style features
      const dialogRef = this.dialog.open(StyleModalDrawingComponent, {
        disableClose: false,
        data: {
          features: this.selectedFeatures$.getValue(),
          icons: this.icons,
          icon: this.icon
        },
        autoFocus: false
      });

      // when dialog box is closed, get label and set it to geometry
      dialogRef.afterClosed().subscribe((data: StyleModalData) => {
        // checks if the user clicked ok
        if (dialogRef.componentInstance.confirmFlag()) {
          this.onFontChange(this.labelsAreShown, data.fontSize, data.fontStyle);
          this.onColorChange(
            this.labelsAreShown,
            this.icon ? true : false,
            data.fillColor,
            data.strokeColor
          );
          this.onOffsetLabelChange(
            this.labelsAreShown,
            data.offsetX,
            data.offsetY
          );
        }
      });
    }, 250);
  }

  /**
   * Open a dialog box to enter label and do something
   * @param olGeometry geometry at draw end or selected geometry
   * @param drawEnd event fired at drawEnd?
   */
  private openDrawDialog(olGeometry, isDrawEnd: boolean) {
    setTimeout(() => {
      // open the dialog box used to enter label
      const dialogRef = this.dialog.open(DrawPopupComponent, {
        disableClose: false,
        data: { olGeometry: olGeometry, map: this.map() }
      });

      // when dialog box is closed, get label and set it to geometry
      dialogRef.afterClosed().subscribe((result) => {
        // checks if the user clicked ok
        if (dialogRef.componentInstance.confirmFlag()) {
          this.updateLabelOfOlGeometry(olGeometry, result.label);
          const labelFlag = dialogRef.componentInstance.labelFlag();
          this.updateLabelType(olGeometry, labelFlag);
          this.updateMeasureUnit(olGeometry, result.measureUnit);

          if (!(olGeometry instanceof OlFeature)) {
            this.updateFontSizeAndStyle(olGeometry, '15', FontType.Arial);
            this.updateFillAndStrokeColor(
              olGeometry,
              'rgba(255,255,255,0.4)',
              'rgba(143,7,7,1)'
            );
            this.updateOffset(
              olGeometry,
              0,
              olGeometry instanceof OlPoint ? -15 : 0
            );
          }

          isDrawEnd
            ? this.onDrawEnd(olGeometry)
            : this.onSelectDraw(olGeometry, result.label, [
                labelFlag,
                result.measureUnit
              ]);
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
        if (entity.properties.labelType === LabelType.Coordinates) {
          const longLat = DDtoDMS(
            [entity.properties.longitude, entity.properties.latitude],
            entity.properties.measureUnit as CoordinatesUnit
          );
          this.updateLabelOfOlGeometry(
            olGeometry,
            '(' + longLat[1] + ', ' + longLat[0] + ')'
          );
        } else if (entity.properties.labelType === LabelType.Length) {
          if (olGeometry instanceof OlCircle) {
            const circularPolygon = fromCircle(olGeometry, 10000);
            const radius = metersToUnit(
              this.getRadius(circularPolygon),
              entity.properties.measureUnit as MeasureLengthUnit
            );
            const unit =
              MeasureLengthUnitAbbreviation[entity.properties.measureUnit];
            const radiusLabel =
              'R: ' + radius.toFixed(2).toString() + ' ' + unit;
            this.updateLabelOfOlGeometry(olGeometry, radiusLabel);
          } else {
            let olGeometryLength = measureOlGeometryLength(
              olGeometry,
              this.map().ol.getView().getProjection().getCode()
            );
            const temp: MeasureLengthUnit = entity.properties
              .measureUnit as MeasureLengthUnit;
            const measureUnit =
              MeasureLengthUnitAbbreviation[entity.properties.measureUnit];
            olGeometryLength = metersToUnit(olGeometryLength, temp);
            const lengthLabel =
              olGeometry instanceof Polygon
                ? 'P: ' +
                  olGeometryLength.toFixed(2).toString() +
                  ' ' +
                  measureUnit
                : olGeometryLength.toFixed(2).toString() + ' ' + measureUnit;
            this.updateLabelOfOlGeometry(olGeometry, lengthLabel);
          }
        } else if (entity.properties.labelType === LabelType.Area) {
          if (olGeometry instanceof OlCircle) {
            const circularPolygon = fromCircle(olGeometry, 10000);
            let circleArea = measureOlGeometryArea(
              circularPolygon,
              this.map().ol.getView().getProjection().getCode()
            );
            const unit =
              MeasureAreaUnitAbbreviation[entity.properties.measureUnit];
            const temp: MeasureAreaUnit = entity.properties
              .measureUnit as MeasureAreaUnit;
            circleArea = squareMetersToUnit(circleArea, temp);
            const areaLabel = circleArea.toFixed(2).toString() + ' ' + unit;
            this.updateLabelOfOlGeometry(olGeometry, areaLabel);
          } else {
            let olGeometryArea = measureOlGeometryArea(
              olGeometry,
              this.map().ol.getView().getProjection().getCode()
            );
            const temp: MeasureAreaUnit = entity.properties
              .measureUnit as MeasureAreaUnit;
            const measureUnit =
              MeasureAreaUnitAbbreviation[entity.properties.measureUnit];
            olGeometryArea = squareMetersToUnit(olGeometryArea, temp);
            const lengthLabel =
              olGeometryArea.toFixed(2).toString() + ' ' + measureUnit;
            this.updateLabelOfOlGeometry(olGeometry, lengthLabel);
          }
        } else {
          this.updateLabelOfOlGeometry(olGeometry, entity.properties.draw);
        }

        this.updateLabelType(olGeometry, entity.properties.labelType);
        this.updateMeasureUnit(olGeometry, entity.properties.measureUnit);
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

  private onSelectDraw(
    olFeature: OlFeature<OlGeometry>,
    label: string,
    labelTypeAndUnit?
  ) {
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
        this.updateLabelType(olGeometry, labelTypeAndUnit[0]);
        this.updateMeasureUnit(olGeometry, labelTypeAndUnit[1]);
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
    let center4326: number[];
    let point4326: number[];
    let lon4326: number;
    let lat4326: number;

    const featureId = feature ? feature.properties.id : olGeometry.ol_uid;
    const projection = this.map().ol.getView().getProjection();

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
        this.radiusFormControl.setValue(Math.round(rad));
      }
    }
    if (this.activeDrawControl?.radiusDrawEnd$.getValue()) {
      rad = this.activeDrawControl?.radiusDrawEnd$.getValue();
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
        fontStyle: olGeometry.get('fontStyle_'),
        drawingStyle: {
          fill: olGeometry.get('fillColor_'),
          stroke: olGeometry.get('strokeColor_')
        },
        offsetX: olGeometry.get('offsetX_'),
        offsetY: olGeometry.get('offsetY_'),
        labelType: olGeometry.get('labelType_'),
        measureUnit: olGeometry.get('measureUnit_')
      },
      meta: {
        id: featureId
      }
    });
    this.activeStore.setLayerExtent();
    this.activeDrawControl?.predefinedRadius$.next(undefined);
    this.activeDrawControl?.radiusDrawEnd$.next(undefined);
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      fill: [''],
      stroke: ['']
    });
  }

  public setupLayer(isNewLayer?: boolean) {
    setTimeout(() => {
      const dialogRef = this.dialog.open(DrawLayerPopupComponent, {
        disableClose: false
      });
      dialogRef.afterClosed().subscribe((label: string) => {
        if (dialogRef.componentInstance.confirmFlag()) {
          this.activeStore.state.updateAll({ selected: false });
          this.activeStore = new FeatureStore<FeatureWithDraw>([], {
            map: this.map()
          });
          this.activeDrawingLayerSource = new OlVectorSource();
          if (this.activeDrawingLayer()) {
            this.activeDrawingLayer()!.opacity = 0;
          }
          this.deactivateDrawControl();
          this.initStore(label, isNewLayer);
          this.activeDrawControl = this.createDrawControl(
            this.fillColor,
            this.strokeColor,
            this.strokeWidth
          );
          this.activeDrawControl?.setGeometryType(this.currGeometryType);
          this.toggleDrawControl();
          this.stores.update((stores) => stores.concat(this.activeStore));
          this.drawControls.update((controls) =>
            controls.concat([
              [this.activeDrawingLayer()?.id, this.activeDrawControl]
            ])
          );
          this.drawControlsEvent.emit(this.drawControls());
          this.layersIDEvent.emit(this.activeDrawingLayer()?.id);
          this.isCreatingNewLayer = false;
          if (!this.labelsAreShown) {
            this.onToggleLabels();
          }
          this.activeLayerChange.emit(this.activeDrawingLayer());
        } else {
          const select = this.select();
          select.value = this.activeDrawingLayer;
          select.selectionChange.emit(
            new MatSelectChange(select, this.activeDrawingLayer())
          );
        }
      });
    }, 250);
  }

  // HTML user interactions

  /**
   * Called when the user double-clicks the selected drawing
   */
  editLabelDrawing(feature) {
    const olGeometryFeature = featureToOl(
      feature,
      this.map().ol.getView().getProjection().getCode()
    );
    this.openDrawDialog(olGeometryFeature, false);
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
    this.activeStore.setLayerExtent();
  }

  /**
   * Called when the user toggles the labels toggle
   */
  onToggleLabels() {
    this.drawStyleService.toggleLabelsAreShown();
    this.labelsAreShown = !this.labelsAreShown;
    this.icon
      ? this.elementStyle(this.labelsAreShown, true)
      : this.elementStyle(this.labelsAreShown, false);
    this.createDrawControl();
  }

  /**
   * Called when the user toggles the Draw control is toggled
   * @internal
   */
  onToggleDrawControl(toggleIsChecked: boolean) {
    toggleIsChecked ? this.toggleDrawControl() : this.deactivateDrawControl();
  }

  onToggleFreehandMode(event: any) {
    if (this.isCircle() && !event.checked) {
      this.activeDrawControl?.ispredefinedRadius$.next(true);
      this.changeRadius(this.radiusFormControl.value);
    } else {
      this.activeDrawControl?.setOlInteractionStyle(
        createInteractionStyle(
          this.fillColor,
          this.strokeColor,
          this.strokeWidth
        )
      );
      this.activeDrawControl?.ispredefinedRadius$.next(false);
    }
    this.freehandMode = event.checked;
    this.activeDrawControl?.freehand$.next(event.checked);
    this.toggleDrawControl();
  }

  // User changes properties of a drawing element

  /**
   * Display the current layer with the current store and the current layerSource
   */

  public onLayerChange(currLayer?: VectorLayer) {
    if (currLayer) {
      this.activeStore.state.updateAll({ selected: false });
      this.isCreatingNewLayer = false;
      this.activeDrawingLayer.update((previous) => {
        previous.opacity = 0;
        currLayer.opacity = 1;
        return currLayer;
      });
      this.deactivateDrawControl();
      if (!this.labelsAreShown) {
        this.onToggleLabels();
      }
      this.activeStore = this.stores().find(
        (store) => store.layer.id === this.activeDrawingLayer()?.id
      );
      const controls = this.drawControls();
      const [_id, selectedControl] = controls.find(
        ([id, _controls]) => id === this.activeDrawingLayer()?.id
      );
      if (selectedControl) {
        this.activeDrawControl = selectedControl;
      }
      this.activeDrawingLayerSource =
        this.activeDrawControl?.olDrawingLayerSource;
      this.activeDrawControl?.setGeometryType(this.currGeometryType);
      this.toggleDrawControl();
    } else {
      this.setupLayer(true);
    }
    this.activeLayerChange.emit(this.activeDrawingLayer());
  }

  public createLayer(newTitle?, isNewLayer?) {
    for (const layer of this.allLayers) {
      const numberId = Number(
        layer.id.toString().replace('igo-draw-layer', '')
      );
      this.layerCounterID = Math.max(numberId, this.layerCounterID);
    }
    this.activeDrawingLayer.set(
      new VectorLayer({
        isIgoInternalLayer: true,
        id: 'igo-draw-layer' + ++this.layerCounterID,
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
            this.map().projection,
            this.icon
          );
        },
        showInLayerList: true,
        exportable: true,
        browsable: false,
        workspace: {
          enabled: false
        }
      })
    );

    tryBindStoreLayer(this.activeStore, this.activeDrawingLayer());

    tryAddLoadingStrategy(
      this.activeStore,
      new FeatureStoreLoadingStrategy({
        motion: FeatureMotion.None
      })
    );

    tryAddSelectionStrategy(
      this.activeStore,
      new FeatureStoreSelectionStrategy({
        map: this.map(),
        motion: FeatureMotion.None,
        many: true
      })
    );
    this.activeStore.layer.visible = true;
    this.activeStore.source.ol.on(
      'removefeature',
      (event: OlVectorSourceEvent) => {
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
    if (this.selectedFeatures$.value.length > 0 && !isAnIcon) {
      this.selectedFeatures$.value.forEach((feature) => {
        const olFeature = featureToOl(
          feature,
          this.map().ol.getView().getProjection().getCode()
        );
        this.updateFillAndStrokeColor(olFeature, fillColor, strokeColor);

        const entity = this.activeStore
          .all()
          .find((e) => e.meta.id === olFeature.getId());
        entity.properties.drawingStyle.fill = olFeature.get('fillColor_');
        entity.properties.drawingStyle.stroke = olFeature.get('strokeColor_');
        this.activeStore.update(entity);
      });
    }

    this.elementStyle(labelsAreShown, isAnIcon);
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
        let olFeature = featureToOl(
          feature,
          this.map().ol.getView().getProjection().getCode()
        );
        this.updateFontSizeAndStyle(olFeature, size, style);
        const entity = this.activeStore
          .all()
          .find((e) => e.meta.id === olFeature.getId());
        entity.properties.fontStyle = olFeature.get('fontStyle_');
        this.activeStore.update(entity);
        olFeature = this.activeStore.layer.ol
          .getSource()
          .getFeatures()
          .find((f) => f.getId() === entity.meta.id);
        olFeature.setProperties({ fontStyle: entity.properties.fontStyle });
        olFeature.changed();
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
        let olFeature = featureToOl(
          feature,
          this.map().ol.getView().getProjection().getCode()
        );
        this.updateOffset(olFeature, offsetX, offsetY);
        const entity = this.activeStore
          .all()
          .find((e) => e.meta.id === olFeature.getId());
        entity.properties.offsetX = olFeature.get('offsetX_');
        entity.properties.offsetY = olFeature.get('offsetY_');
        this.activeStore.update(entity);
        olFeature = this.activeStore.layer.ol
          .getSource()
          .getFeatures()
          .find((f) => f.getId() === entity.meta.id);
        olFeature.setProperties({
          offsetX: entity.properties.offsetX,
          offsetY: entity.properties.offsetY
        });
        olFeature.changed();
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
  onGeometryTypeChange(geometryType: Type) {
    this.currGeometryType = geometryType;
    this.activeDrawControl?.setGeometryType(geometryType);
    this.freehandMode
      ? this.onToggleFreehandMode({ checked: true })
      : this.onToggleFreehandMode({ checked: false });
    this.toggleDrawControl();
  }

  // Updates the properties of olFeature inputted

  /**
   * Update the label of a geometry when a label is entered in a dialog box
   * @param OlFeature the feature
   * @param label the label
   */
  private updateLabelOfOlGeometry(OlFeature, label: string) {
    OlFeature.setProperties(
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
        fontStyle_: `${fontSize}px ${fontStyle}`
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

  private updateLabelType(
    olFeature: OlFeature<OlGeometry>,
    typeOfLabel: LabelType | [LabelType, LabelType]
  ) {
    olFeature.setProperties(
      {
        labelType_: typeOfLabel
      },
      true
    );
  }

  private updateMeasureUnit(
    olFeature: OlFeature<OlGeometry>,
    measureUnit: MeasureLengthUnit | MeasureAreaUnit | CoordinatesUnit | []
  ) {
    olFeature.setProperties(
      {
        measureUnit_: measureUnit
      },
      true
    );
  }

  // Updates values of the selected element on the HTML view

  getFeatureFontSize(): string {
    return this.selectedFeatures$.value.length > 0
      ? this.selectedFeatures$.value[0].properties.fontStyle
          .split(' ')[0]
          .replace('px', '')
      : '15';
  }

  getFeatureFontStyle() {
    return this.selectedFeatures$.value.length > 0
      ? this.selectedFeatures$.value[0].properties.fontStyle.substring(
          this.selectedFeatures$.value[0].properties.fontStyle.indexOf(' ') + 1
        )
      : FontType.Arial;
  }

  getFeatureFillColor() {
    return this.selectedFeatures$.value.length > 0
      ? this.selectedFeatures$.value[0].properties.drawingStyle.fill
      : 'rgba(255,255,255,0.4)';
  }

  getFeatureStrokeColor() {
    return this.selectedFeatures$.value.length > 0
      ? this.selectedFeatures$.value[0].properties.drawingStyle.stroke
      : 'rgba(143,7,7,1)';
  }

  getFeatureOffsetX() {
    return this.selectedFeatures$.value.length > 0
      ? this.selectedFeatures$.value[0].properties.offsetX
      : this.drawStyleService.getOffsetX();
  }

  getFeatureOffsetY() {
    return this.selectedFeatures$.value.length > 0
      ? this.selectedFeatures$.value[0].properties.offsetY
      : '0';
  }

  get allFontStyles(): string[] {
    return Object.values(FontType);
  }

  get allLayers() {
    return this.map().layerController.all.filter((layer) =>
      String(layer.id).includes('igo-draw-layer')
    );
  }

  updateHeightTable() {
    // Check the amount of rows as a possible alternative
    this.numberOfDrawings = this.activeStore.count$.getValue();
    this.numberOfDrawings > 10
      ? (this.tableTemplate.tableHeight = '35vh')
      : (this.tableTemplate.tableHeight = 'auto');
  }

  updateActiveLayer() {
    const currLayer = this.allLayers.find(
      (layer) => layer.title === this.activeDrawingLayer()?.title
    );
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
          this.map().ol.removeOverlay(olTooltip);
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
    if (!this.activeDrawControl) {
      return;
    }

    if (this.drawEnd$$) {
      this.drawEnd$$.unsubscribe();
    }

    this.activeDrawControl?.setOlMap(undefined);
    this.drawControlIsActive = false;
  }

  /**
   * Activate a given control
   */
  private activateDrawControl() {
    this.drawControlIsDisabled = false;
    this.drawControlIsActive = true;
    this.drawEnd$$ = this.activeDrawControl?.end$.subscribe(
      (olGeometry: OlGeometry) => {
        this.openDrawDialog(olGeometry, true);
      }
    );

    this.activeDrawControl?.modify$.subscribe((olGeometry: OlGeometry) => {
      this.onModifyDraw(olGeometry);
    });

    if (!this.drawSelect$$) {
      this.drawSelect$$ = this.activeDrawControl?.select$.subscribe(
        (olFeature: OlFeature<OlGeometry>) => {
          this.openDrawDialog(olFeature, false);
        }
      );
    }
    this.activeDrawControl?.setOlMap(this.map().ol, true);
  }

  /**
   * get the geometry of design
   *
   */

  isPoint() {
    return (
      this.activeDrawControl?.getGeometryType() === this.geometryType.Point
    );
  }

  isLineString() {
    return (
      this.activeDrawControl?.getGeometryType() === this.geometryType.LineString
    );
  }

  isPolygon() {
    return (
      this.activeDrawControl?.getGeometryType() === this.geometryType.Polygon
    );
  }

  isCircle() {
    return (
      this.activeDrawControl?.getGeometryType() === this.geometryType.Circle
    );
  }

  /**
   * The fonction to predefine the radius of the user
   *
   */

  changeRadius(radius: number) {
    let radiusMeters: number;

    if (radius) {
      this.measureUnit === MeasureLengthUnit.Meters
        ? (radiusMeters = radius)
        : (radiusMeters = radius * 1000);
    } else {
      radiusMeters = undefined;
    }

    const pointStyle = (feature: OlFeature<OlGeometry>, resolution: number) => {
      const geom = feature.getGeometry() as OlPoint;
      const coordinates = olproj.transform(
        geom.getCoordinates(),
        this.map().projection,
        'EPSG:4326'
      );

      const radius =
        radiusMeters / Math.cos((Math.PI / 180) * coordinates[1]) / resolution;
      this.activeDrawControl?.predefinedRadius$.next(radiusMeters);
      return new OlStyle.Style({
        image: new OlStyle.Circle({
          radius: radius,
          stroke: new OlStyle.Stroke({
            width: 1,
            color: 'rgba(143,7,7,1)'
          }),
          fill: new OlStyle.Fill({
            color: 'rgba(255,255,255,0.4)'
          })
        })
      });
    };

    this.activeDrawControl?.setOlInteractionStyle(pointStyle);
    this.toggleDrawControl();
  }

  onMeasureUnitChange(selectedMeasureUnit: MeasureLengthUnit) {
    if (selectedMeasureUnit === this.measureUnit) {
      return;
    } else {
      this.measureUnit = selectedMeasureUnit;
      this.measureUnit === MeasureLengthUnit.Meters
        ? this.radiusFormControl.setValue(this.radiusFormControl.value * 1000)
        : this.radiusFormControl.setValue(this.radiusFormControl.value / 1000);
    }
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
          this.map().projection,
          this.icon
        );
      });
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
          feature.get('offsetY'),
          this.map().projection
        );
      });
    }
  }

  private getRadius(olGeometry): number {
    const length = getLength(olGeometry);
    return Number(length / (2 * Math.PI));
  }
}
