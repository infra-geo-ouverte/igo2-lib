import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  EntityRecord,
  EntityTableComponent,
  EntityTableTemplate
} from '@igo2/common/entity';
import { LanguageService } from '@igo2/core/language';
import { IgoLanguageModule } from '@igo2/core/language';
import { StorageScope, StorageService } from '@igo2/core/storage';
import { uuid } from '@igo2/utils';

import OlFeature from 'ol/Feature';
import { unByKey } from 'ol/Observable';
import OlOverlay from 'ol/Overlay';
import OlGeoJSON from 'ol/format/GeoJSON';
import OlLineString from 'ol/geom/LineString';
import OlPolygon from 'ol/geom/Polygon';
import OlVectorSource from 'ol/source/Vector';
import { VectorSourceEvent as OlVectorSourceEvent } from 'ol/source/Vector';
import OlStyle from 'ol/style/Style';

import { BehaviorSubject, Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

import { FeatureDataSource } from '../../datasource/shared/datasources';
import {
  FEATURE,
  FeatureStore,
  FeatureStoreLoadingStrategy,
  FeatureStoreSelectionStrategy,
  tryAddLoadingStrategy,
  tryAddSelectionStrategy,
  tryBindStoreLayer
} from '../../feature';
import { DrawControl, ModifyControl } from '../../geometry/shared';
import { VectorLayer } from '../../layer/shared';
import { IgoMap } from '../../map/shared/map';
import {
  MeasureAreaUnit,
  MeasureLengthUnit,
  MeasureType
} from '../shared/measure.enum';
import {
  FeatureWithMeasure,
  Measure,
  MeasurerDialogData
} from '../shared/measure.interfaces';
import {
  createMeasureInteractionStyle,
  createMeasureLayerStyle,
  formatMeasure,
  getTooltipsOfOlGeometry,
  measureOlGeometry,
  metersToUnit,
  squareMetersToUnit,
  updateOlTooltipAtCenter,
  updateOlTooltipsAtMidpoints
} from '../shared/measure.utils';
import { MeasurerDialogComponent } from './measurer-dialog.component';
import { MeasurerItemComponent } from './measurer-item.component';

/**
 * Tool to measure lengths and areas
 */
@Component({
  selector: 'igo-measurer',
  templateUrl: './measurer.component.html',
  styleUrls: ['./measurer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatDividerModule,
    MeasurerItemComponent,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    EntityTableComponent,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class MeasurerComponent implements OnInit, OnDestroy {
  private languageService = inject(LanguageService);
  private dialog = inject(MatDialog);
  private storageService = inject(StorageService);
  private document = inject<Document>(DOCUMENT);

  /**
   * Table template
   * @internal
   */
  public tableTemplate: EntityTableTemplate;

  private subscriptions$$: Subscription[] = [];

  /**
   * Reference to the MeasureType enum
   * @internal
   */
  public measureType = MeasureType;

  /**
   * Reference to the AreaMeasureUnit enum
   * @internal
   */
  public measureAreaUnit = MeasureAreaUnit;

  /**
   * Reference to the LengthMeasureUnit enum
   * @internal
   */
  public measureLengthUnit = MeasureLengthUnit;

  /**
   * Whether measure units should be automatically determined
   * @internal
   */
  public measureUnitsAuto = false;

  /**
   * Whether display of distances of areas
   * @internal
   */
  public displayDistance = true;

  /**
   * Whether display of distances of lines
   * @internal
   */
  public displayLines = true;

  /**
   * Whether display of areas
   * @internal
   */
  public displayAreas = true;

  /**
   * Observable of line boolean
   * @internal
   */
  public hasLine$ = new BehaviorSubject<boolean>(false);

  /**
   * Observable of area boolean
   * @internal
   */
  public hasArea$ = new BehaviorSubject<boolean>(false);

  /**
   * Observable of area
   * @internal
   */
  public measure$ = new BehaviorSubject<Measure>({});

  /**
   * Observable of selected features
   * @internal
   */
  public selectedFeatures$ = new BehaviorSubject<FeatureWithMeasure[]>([]);

  /**
   * OL draw source
   * @internal
   */
  public showTooltips = true;

  /**
   * Whether draw control toggle is disabled or not
   * @internal
   */
  public drawControlIsDisabled = true;

  /**
   * Draw line control
   */
  private drawLineControl: DrawControl;

  /**
   * Draw polygon control
   */
  private drawPolygonControl: DrawControl;

  /**
   * Modify control
   */
  private modifyControl: ModifyControl;

  /**
   * Active OL geometry
   */
  private activeOlGeometry: OlLineString | OlPolygon;

  /**
   * Active mlength unit
   */
  public activeLengthUnit: MeasureLengthUnit = MeasureLengthUnit.Meters;

  /**
   * Active area unit
   */
  public activeAreaUnit: MeasureAreaUnit = MeasureAreaUnit.SquareMeters;

  /**
   * Feature added listener key
   */
  private onFeatureAddedKey;

  /**
   * Feature removed listener key
   */
  private onFeatureRemovedKey;

  /**
   * Active draw control
   * @internal
   */
  private activeDrawControl: DrawControl;

  /**
   * Subscription to draw start
   */
  private drawStart$$: Subscription;

  /**
   * Subscription to draw end
   */
  private drawEnd$$: Subscription;

  /**
   * Subscription to controls changes
   */
  private drawChanges$$: Subscription;

  /**
   * Subscription to modify start
   */
  private modifyStart$$: Subscription;

  /**
   * Subscription to modify end
   */
  private modifyEnd$$: Subscription;

  /**
   * Subscription to controls changes
   */
  private modifyChanges$$: Subscription;

  /**
   * Subscription to measures selection
   */
  private selectedFeatures$$: Subscription;

  /**
   * OL draw source
   */
  private olDrawSource = new OlVectorSource();

  /**
   * The map to measure on
   */
  @Input() map: IgoMap;

  /**
   * The measures store
   */
  @Input() store: FeatureStore<FeatureWithMeasure>;

  /**
   * Measure type
   * @internal
   */
  @Input()
  set activeMeasureType(value: MeasureType) {
    this.setActiveMeasureType(value);
  }
  get activeMeasureType(): MeasureType {
    return this._activeMeasureType;
  }
  private _activeMeasureType: MeasureType;

  /**
   * The minimum length a segment must have to display a tooltip.
   * It also applies to area tooltips.
   */
  @Input() minSegmentLength = 10;

  @ViewChild('table', { static: true }) table: EntityTableComponent;

  /**
   * Wheter one of the draw control is active
   * @internal
   */
  get drawControlIsActive(): boolean {
    return this.activeDrawControl !== undefined;
  }

  get projection(): string {
    return this.map.ol.getView().getProjection().getCode();
  }

  constructor() {
    this.tableTemplate = {
      selection: true,
      selectMany: true,
      selectionCheckbox: true,
      sort: true,
      columns: [
        {
          name: 'length',
          title: this.languageService.translate.instant(
            'igo.geo.measure.lengthHeader'
          ),
          valueAccessor: (localFeature: FeatureWithMeasure) => {
            const unit = this.activeLengthUnit;
            const measure = metersToUnit(
              localFeature.properties.measure.length,
              unit
            );
            return formatMeasure(measure, {
              decimal: 1,
              unit,
              unitAbbr: false,
              locale: 'fr'
            });
          }
        },
        {
          name: 'area',
          title: this.languageService.translate.instant(
            'igo.geo.measure.areaHeader'
          ),
          valueAccessor: (localFeature: FeatureWithMeasure) => {
            const unit = this.activeAreaUnit;
            const measure = squareMetersToUnit(
              localFeature.properties.measure.area,
              unit
            );
            return measure
              ? formatMeasure(measure, {
                  decimal: 1,
                  unit,
                  unitAbbr: false,
                  locale: 'fr'
                })
              : '';
          }
        }
      ]
    };
  }

  /**
   * Add draw controls and activate one
   * @internal
   */
  ngOnInit() {
    this.getSavedUnits();
    this.initStore();
    this.createDrawLineControl();
    this.createDrawPolygonControl();
    this.createModifyControl();
    this.toggleDrawControl();
    this.updateTooltipsOfOlSource(this.store.source.ol);
    this.checkDistanceAreaToggle();
    this.setActiveMeasureType(MeasureType.Length);
  }

  /**
   * Clear the overlay layer and any interaction added by this component.
   * @internal
   */
  ngOnDestroy() {
    if (this.store.count === 0) {
      this.store.map.layerController.remove(this.store.layer);
    }

    this.setActiveMeasureType(undefined);
    this.deactivateModifyControl();
    this.freezeStore();
    this.subscriptions$$.map((s) => s.unsubscribe());
  }

  /**
   * Set the measure type
   * @internal
   */
  onMeasureTypeChange(measureType: MeasureType) {
    this.activeMeasureType = measureType;
  }

  /**
   * Activate or deactivate the current draw control
   * @internal
   */
  onToggleDrawControl(toggle: boolean) {
    if (toggle === true) {
      this.toggleDrawControl();
    } else {
      this.deactivateDrawControl();
    }
  }

  /**
   * Activate or deactivate the current draw control
   * @internal
   */
  onToggleMeasureUnitsAuto(toggle: boolean) {
    this.measureUnitsAuto = toggle;
  }

  /**
   * Activate or deactivate the current display of distances of the areas
   * @internal
   */
  onToggleDisplayDistance(toggle: boolean) {
    this.displayDistance = toggle;
    this.onDisplayDistance();
    this.storageService.set('distanceToggle', toggle, StorageScope.SESSION);
  }

  /**
   * Activate or deactivate the current display of distances of the lines
   * @internal
   */
  onToggleDisplayLines(toggle: boolean) {
    this.displayLines = toggle;
    this.onDisplayLines();
    this.storageService.set('linesToggle', toggle, StorageScope.SESSION);
  }

  /**
   * Activate or deactivate the current display of areas
   * @internal
   */
  onToggleDisplayAreas(toggle: boolean) {
    this.displayAreas = toggle;
    this.onDisplayAreas();
    this.storageService.set('areasToggle', toggle, StorageScope.SESSION);
  }

  /**
   * Set display parametres in current values
   * @internal
   */
  checkDistanceAreaToggle() {
    if (this.storageService.get('distanceToggle') === false) {
      this.displayDistance = false;
    }
    if (this.storageService.get('linesToggle') === false) {
      this.displayLines = false;
    }
    if (this.storageService.get('areasToggle') === false) {
      this.displayAreas = false;
    }
  }

  /**
   * Activate or deactivate the current display of distances of areas
   * @internal
   */
  onDisplayDistance() {
    const elements: HTMLCollectionOf<Element> =
      this.document.getElementsByClassName(
        'igo-map-tooltip-measure-polygone-segments'
      );
    if (this.displayDistance) {
      Array.from(elements).map((value: Element) =>
        value.classList.remove('igo-map-tooltip-hidden')
      );
    } else {
      Array.from(elements).map((value: Element) =>
        value.classList.add('igo-map-tooltip-hidden')
      );
    }
  }

  /**
   * Activate or deactivate the current display of distances of lines
   * @internal
   */
  onDisplayLines() {
    const elements: HTMLCollectionOf<Element> =
      this.document.getElementsByClassName(
        'igo-map-tooltip-measure-line-segments'
      );

    if (this.displayLines) {
      Array.from(elements).map((value: Element) => {
        value.classList.remove('igo-map-tooltip-hidden');
      });
    } else {
      Array.from(elements).map((value: Element) => {
        value.classList.add('igo-map-tooltip-hidden');
      });
    }
  }

  /**
   * Activate or deactivate the current display of areas
   * @internal
   */
  onDisplayAreas() {
    const elements: HTMLCollectionOf<Element> =
      this.document.getElementsByClassName('igo-map-tooltip-measure-area');

    if (this.displayAreas) {
      Array.from(elements).map((value: Element) =>
        value.classList.remove('igo-map-tooltip-hidden')
      );
    } else {
      Array.from(elements).map((value: Element) =>
        value.classList.add('igo-map-tooltip-hidden')
      );
    }
  }

  /**
   * Set the measure type
   * @internal
   */
  onLengthUnitChange(unit: MeasureLengthUnit) {
    this.activeLengthUnit = unit;
    this.saveCurrentUnits();
    this.refreshTableAndTooltip();
  }

  /**
   * Set the measure type
   * @internal
   */
  onAreaUnitChange(unit: MeasureAreaUnit) {
    this.activeAreaUnit = unit;
    this.saveCurrentUnits();
    this.refreshTableAndTooltip();
  }

  private refreshTableAndTooltip(): void {
    this.store.stateView.clear();

    this.updateTooltipsOfOlSource(this.store.source.ol);
    if (this.activeOlGeometry !== undefined) {
      this.updateTooltipsOfOlGeometry(this.activeOlGeometry);
    }
  }

  onCalculateClick() {
    const features = this.selectedFeatures$.value;
    const area = features.reduce(
      (sum: number, localFeature: FeatureWithMeasure) => {
        return sum + localFeature.properties.measure.area || 0;
      },
      0
    );
    const length = features.reduce(
      (sum: number, localFeature: FeatureWithMeasure) => {
        if (localFeature.geometry.type === 'Polygon') {
          return sum;
        }
        return sum + localFeature.properties.measure.length || 0;
      },
      0
    );
    const perimeter = features.reduce(
      (sum: number, localFeature: FeatureWithMeasure) => {
        if (localFeature.geometry.type === 'LineString') {
          return sum;
        }
        return sum + localFeature.properties.measure.length || 0;
      },
      0
    );

    this.openDialog({
      area,
      length,
      perimeter
    });
  }

  onDeleteClick() {
    this.store.deleteMany(this.selectedFeatures$.value);
    this.selectedFeatures$.value.forEach((selectedFeature) => {
      this.olDrawSource.getFeatures().forEach((drawingLayerFeature) => {
        const geometry = drawingLayerFeature.getGeometry() as any;
        if (selectedFeature.properties.id === geometry.ol_uid) {
          this.olDrawSource.removeFeature(drawingLayerFeature);
        }
      });
    });
  }

  onModifyClick() {
    if (this.selectedFeatures$.value.length !== 1) {
      return;
    }

    if (this.modifyControl.active === true) {
      this.deactivateModifyControl();
      this.toggleDrawControl();
    } else {
      const localFeature = this.selectedFeatures$.value[0];
      const olFeatures = this.store.layer.ol.getSource().getFeatures();
      const olFeature = olFeatures.find((_olFeature: OlFeature) => {
        return _olFeature.get('id') === localFeature.properties.id;
      });

      if (olFeature !== undefined) {
        this.deactivateDrawControl();
        this.activateModifyControl();

        const olGeometry = olFeature.getGeometry();
        this.clearTooltipsOfOlGeometry(olGeometry as OlLineString | OlPolygon);
        this.modifyControl.setOlGeometry(olGeometry);
      }
    }
  }

  private openDialog(data: MeasurerDialogData): void {
    this.dialog.open(MeasurerDialogComponent, { data });
  }

  /**
   * Initialize the measure store and set up some listeners
   * @internal
   */
  private initStore() {
    const store = this.store;

    let layer = new VectorLayer({
      title: this.languageService.translate.instant(
        'igo.geo.measure.layerTitle'
      ),
      isIgoInternalLayer: true,
      id: `igo-measures-${uuid()}`,
      zIndex: 200,
      source: new FeatureDataSource(),
      style: createMeasureLayerStyle(),
      showInLayerList: true,
      exportable: true,
      visible: true,
      browsable: false,
      workspace: { enabled: false }
    });
    layer = tryBindStoreLayer(store, layer);

    layer.visible$.subscribe((visible) => {
      const elements: HTMLCollectionOf<Element> =
        this.document.getElementsByClassName('igo-map-tooltip-measure');

      if (visible) {
        Array.from(elements).map((value: Element) =>
          value.classList.remove('igo-map-tooltip-measure-by-display')
        );
      } else {
        Array.from(elements).map((value: Element) =>
          value.classList.add('igo-map-tooltip-measure-by-display')
        );
      }
    });

    tryAddLoadingStrategy(store);

    tryAddSelectionStrategy(
      store,
      new FeatureStoreSelectionStrategy({
        map: this.map,
        many: true
      })
    );

    this.onFeatureAddedKey = store.source.ol.on(
      'addfeature',
      (event: OlVectorSourceEvent) => {
        const localFeature = event.feature;
        const olGeometry = localFeature.getGeometry() as any;
        this.updateMeasureOfOlGeometry(olGeometry, localFeature.get('measure'));
        this.onDisplayDistance();
        this.onDisplayLines();
        this.onDisplayAreas();
      }
    );

    this.onFeatureRemovedKey = store.source.ol.on(
      'removefeature',
      (event: OlVectorSourceEvent) => {
        const olGeometry = event.feature.getGeometry() as any;
        this.clearTooltipsOfOlGeometry(olGeometry);
      }
    );

    this.selectedFeatures$$ = store.stateView
      .manyBy$((record: EntityRecord<FeatureWithMeasure>) => {
        return record.state.selected === true;
      })
      .pipe(
        skip(1) // Skip initial emission
      )
      .subscribe((records: EntityRecord<FeatureWithMeasure>[]) => {
        if (this.modifyControl.active === true) {
          this.deactivateModifyControl();
        }
        this.selectedFeatures$.next(records.map((record) => record.entity));
      });

    this.subscriptions$$.push(
      this.store.entities$.subscribe((objectsExists) => {
        if (
          objectsExists.find(
            (objectExist) => objectExist.geometry.type === 'Polygon'
          )
        ) {
          this.hasArea$.next(true);
        } else {
          this.hasArea$.next(false);
        }

        if (
          objectsExists.find(
            (objectExist) => objectExist.geometry.type === 'LineString'
          )
        ) {
          this.hasLine$.next(true);
        } else {
          this.hasLine$.next(false);
        }
      })
    );
  }

  /**
   * Freeze any store, meaning the layer is removed, strategies are deactivated
   * and some listener removed
   * @internal
   */
  private freezeStore() {
    const store = this.store;
    this.selectedFeatures$$.unsubscribe();
    unByKey(this.onFeatureAddedKey);
    unByKey(this.onFeatureRemovedKey);
    store.deactivateStrategyOfType(FeatureStoreLoadingStrategy);
    store.deactivateStrategyOfType(FeatureStoreSelectionStrategy);
  }

  /**
   * Create a draw line control
   */
  private createDrawLineControl() {
    this.drawLineControl = new DrawControl({
      geometryType: 'LineString',
      drawingLayerSource: this.olDrawSource,
      interactionStyle: createMeasureInteractionStyle(),
      drawingLayerStyle: new OlStyle({})
    });
  }

  /**
   * Create a draw polygon control
   */
  private createDrawPolygonControl() {
    this.drawPolygonControl = new DrawControl({
      geometryType: 'Polygon',
      drawingLayerSource: this.olDrawSource,
      interactionStyle: createMeasureInteractionStyle(),
      drawingLayerStyle: new OlStyle({})
    });
  }

  /**
   * Create a draw polygon control
   */
  private createModifyControl() {
    this.modifyControl = new ModifyControl({
      source: this.olDrawSource,
      drawStyle: createMeasureInteractionStyle(),
      layerStyle: new OlStyle({})
    });
  }

  /**
   * Activate the right control
   */
  private toggleDrawControl() {
    this.deactivateDrawControl();
    // this.deactivateModifyControl();
    if (this.activeMeasureType === MeasureType.Length) {
      this.activateDrawControl(this.drawLineControl);
    } else if (this.activeMeasureType === MeasureType.Area) {
      this.activateDrawControl(this.drawPolygonControl);
    }
  }

  /**
   * Activate a given control
   * @param drawControl Draw control
   */
  private activateDrawControl(drawControl: DrawControl) {
    this.drawControlIsDisabled = false;
    this.activeDrawControl = drawControl;
    this.drawStart$$ = drawControl.start$.subscribe(
      (olGeometry: OlLineString | OlPolygon) => this.onDrawStart(olGeometry)
    );
    this.drawEnd$$ = drawControl.end$.subscribe(
      (olGeometry: OlLineString | OlPolygon) => this.onDrawEnd(olGeometry)
    );
    this.drawChanges$$ = drawControl.changes$.subscribe(
      (olGeometry: OlLineString | OlPolygon) => this.onDrawChanges(olGeometry)
    );
    this.drawChanges$$ = drawControl.abort$.subscribe(
      (olGeometry: OlLineString | OlPolygon) => {
        this.clearTooltipsOfOlGeometry(olGeometry);
        this.clearMeasures();
      }
    );
    drawControl.setOlMap(this.map.ol, false);
  }

  /**
   * Deactivate the active draw control
   */
  private deactivateDrawControl() {
    if (this.activeDrawControl === undefined) {
      return;
    }

    this.olDrawSource.clear();
    if (this.drawStart$$ !== undefined) {
      this.drawStart$$.unsubscribe();
    }
    if (this.drawEnd$$ !== undefined) {
      this.drawEnd$$.unsubscribe();
    }
    if (this.drawChanges$$ !== undefined) {
      this.drawChanges$$.unsubscribe();
    }

    this.clearTooltipsOfOlSource(this.olDrawSource);
    if (this.activeOlGeometry !== undefined) {
      this.clearTooltipsOfOlGeometry(this.activeOlGeometry);
    }
    this.activeDrawControl.setOlMap(undefined);
    this.activeDrawControl = undefined;
    this.activeOlGeometry = undefined;
  }

  private setActiveMeasureType(measureType: MeasureType) {
    this._activeMeasureType = measureType;
    this.clearMeasures();
    this.toggleDrawControl();
  }

  /**
   * Clear the draw source and track the geometry being drawn
   * @param olGeometry Ol linestring or polygon
   */
  private onDrawStart(olGeometry: OlLineString | OlPolygon) {
    this.activeOlGeometry = olGeometry;
  }

  /**
   * Clear the draw source and track the geometry being draw
   * @param olGeometry Ol linestring or polygon
   */
  private onDrawEnd(olGeometry: OlLineString | OlPolygon) {
    this.activeOlGeometry = undefined;
    this.finalizeMeasureOfOlGeometry(olGeometry);
    this.addFeatureToStore(olGeometry);
    this.clearTooltipsOfOlGeometry(olGeometry);
    this.olDrawSource.clear(true);
  }

  /**
   * Update measures observables and map tooltips
   * @param olGeometry Ol linestring or polygon
   */
  private onDrawChanges(olGeometry: OlLineString | OlPolygon) {
    const measure = measureOlGeometry(olGeometry, this.projection);
    this.updateMeasureOfOlGeometry(
      olGeometry,
      Object.assign({}, measure, {
        area: undefined // We don't want to display an area tooltip while drawing.
      })
    );
    this.measure$.next(measure);
  }

  /**
   * Activate a given control
   * @param modifyControl Modify control
   */
  private activateModifyControl() {
    const selection = this.store.getStrategyOfType(
      FeatureStoreSelectionStrategy
    ) as FeatureStoreSelectionStrategy;
    selection.deactivate();
    selection.clear();

    this.modifyStart$$ = this.modifyControl.start$.subscribe(
      (olGeometry: OlLineString | OlPolygon) => this.onModifyStart(olGeometry)
    );
    this.modifyEnd$$ = this.modifyControl.end$.subscribe(
      (olGeometry: OlLineString | OlPolygon) => this.onModifyEnd(olGeometry)
    );
    this.modifyChanges$$ = this.modifyControl.changes$.subscribe(
      (olGeometry: OlLineString | OlPolygon) => this.onModifyChanges(olGeometry)
    );
    this.modifyControl.setOlMap(this.map.ol);
  }

  /**
   * Deactivate the active modify control
   */
  private deactivateModifyControl() {
    if (this.modifyStart$$ !== undefined) {
      this.modifyStart$$.unsubscribe();
    }
    if (this.modifyEnd$$ !== undefined) {
      this.modifyEnd$$.unsubscribe();
    }
    if (this.modifyChanges$$ !== undefined) {
      this.modifyChanges$$.unsubscribe();
    }

    if (this.activeOlGeometry !== undefined) {
      if (this.selectedFeatures$.value.length === 1) {
        const localFeature = this.selectedFeatures$.value[0];
        this.addFeatureToStore(this.activeOlGeometry, localFeature);
      }
      this.finalizeMeasureOfOlGeometry(this.activeOlGeometry);
    }

    this.olDrawSource.clear();

    this.store.activateStrategyOfType(FeatureStoreSelectionStrategy);

    this.activeOlGeometry = undefined;
    this.modifyControl.setOlMap(undefined);
  }

  /**
   * Clear the draw source and track the geometry being drawn
   * @param olGeometry Ol linestring or polygon
   */
  private onModifyStart(olGeometry: OlLineString | OlPolygon) {
    this.onDrawStart(olGeometry);
  }

  /**
   * Update measures observables and map tooltips
   * @param olGeometry Ol linestring or polygon
   */
  private onModifyChanges(olGeometry: OlLineString | OlPolygon) {
    this.onDrawChanges(olGeometry);
  }

  /**
   * Clear the draw source and track the geometry being draw
   * @param olGeometry Ol linestring or polygon
   */
  private onModifyEnd(olGeometry: OlLineString | OlPolygon) {
    this.finalizeMeasureOfOlGeometry(olGeometry);
  }

  private finalizeMeasureOfOlGeometry(olGeometry: OlLineString | OlPolygon) {
    const measure = measureOlGeometry(olGeometry, this.projection);
    this.updateMeasureOfOlGeometry(olGeometry, measure);
  }

  /**
   * Update measures observables
   * @param olGeometry Ol linestring or polygon
   * @param measure Measure
   */
  private updateMeasureOfOlGeometry(
    olGeometry: OlLineString | OlPolygon,
    measure: Measure
  ) {
    olGeometry.setProperties({ _measure: measure }, true);
    this.updateTooltipsOfOlGeometry(olGeometry);
  }

  /**
   * Clear the measures observables
   */
  private clearMeasures() {
    this.measure$.next({});
  }

  /**
   * Add a feature with measures to the store. The loading stragegy of the store
   * will trigger and add the feature to the map.
   * @internal
   */
  private addFeatureToStore(olGeometry, localFeature?: FeatureWithMeasure) {
    const featureId = localFeature
      ? localFeature.properties.id
      : olGeometry.ol_uid;
    const projection = this.map.ol.getView().getProjection();
    const geometry = new OlGeoJSON().writeGeometryObject(olGeometry, {
      featureProjection: projection,
      dataProjection: projection
    }) as any;
    this.store.update({
      type: FEATURE,
      geometry,
      projection: projection.getCode(),
      properties: {
        id: featureId,
        measure: olGeometry.get('_measure')
      },
      meta: {
        id: featureId
      }
    });
  }

  /**
   * Update all the tooltips of an OL geometry
   * @param olGeometry OL Geometry
   * @param lengths Lengths of the OL geometry's segments
   * @param measureUnit Display tooltip measure in those units
   */
  private updateTooltipsOfOlGeometry(olGeometry: OlLineString | OlPolygon) {
    const measure = olGeometry.get('_measure');
    const lengths = measure.lengths;
    const area = measure.area;

    const olMidpointsTooltips = updateOlTooltipsAtMidpoints(olGeometry);
    if (lengths.length === olMidpointsTooltips.length) {
      for (let i = 0; i < olMidpointsTooltips.length; i++) {
        const length = lengths[i];
        if (length !== undefined) {
          this.updateOlTooltip(
            olMidpointsTooltips[i],
            metersToUnit(length, this.activeLengthUnit),
            this.activeLengthUnit,
            MeasureType.Length
          );
        }
      }
    }

    if (area !== undefined) {
      this.updateOlTooltip(
        updateOlTooltipAtCenter(olGeometry),
        squareMetersToUnit(area, this.activeAreaUnit),
        this.activeAreaUnit,
        MeasureType.Area
      );
    }
  }

  /**
   * Clear the tooltips of an OL geometrys
   * @param olGeometry OL geometry with tooltips
   */
  private clearTooltipsOfOlGeometry(olGeometry: OlLineString | OlPolygon) {
    getTooltipsOfOlGeometry(olGeometry).forEach(
      (olTooltip: OlOverlay | undefined) => {
        if (olTooltip !== undefined && olTooltip.getMap() !== undefined) {
          this.map.ol.removeOverlay(olTooltip);
        }
      }
    );
  }

  /**
   * Show the map tooltips of all the geometries of a source
   */
  private updateTooltipsOfOlSource(olSource: OlVectorSource) {
    olSource.forEachFeature((olFeature: OlFeature) => {
      this.updateTooltipsOfOlGeometry(olFeature.getGeometry() as any);
    });
  }

  /**
   * Clear the map tooltips
   * @param olDrawSource OL vector source
   */
  private clearTooltipsOfOlSource(olSource: OlVectorSource) {
    olSource.forEachFeature((olFeature: OlFeature) => {
      const olGeometry = olFeature.getGeometry();
      if (olGeometry !== undefined) {
        this.clearTooltipsOfOlGeometry(olFeature.getGeometry() as any);
      }
    });
  }

  /**
   * Update an OL tooltip properties and inner HTML and add it to the map if possible
   * @param olTooltip OL tooltip
   * @param measure The measure valeu ti display
   * @param measureUnit Display tooltip measure in those units
   */
  private updateOlTooltip(
    olTooltip: OlOverlay,
    measure: number,
    unit: MeasureAreaUnit | MeasureLengthUnit,
    type: MeasureType
  ) {
    olTooltip.setProperties(
      { _measure: measure, _unit: unit, _type: type },
      true
    );
    olTooltip.getElement().innerHTML = this.computeTooltipInnerHTML(olTooltip);
    if (this.shouldShowTooltip(olTooltip)) {
      this.map.ol.addOverlay(olTooltip);
    }
  }

  /**
   * Compute a tooltip's content
   * @param olTooltip OL overlay
   * @returns Inner HTML
   */
  private computeTooltipInnerHTML(olTooltip: OlOverlay): string {
    const properties = olTooltip.getProperties() as any;
    return formatMeasure(
      properties._measure,
      {
        decimal: 1,
        unit: properties._unit,
        unitAbbr: true,
        locale: 'fr'
      },
      this.languageService
    );
  }

  /**
   * Whether a tooltip should be showned based on the length
   * of the segment it is bound to.
   * @param olTooltip OL overlay
   * @returns True if the tooltip should be shown
   */
  private shouldShowTooltip(olTooltip: OlOverlay): boolean {
    if (this.showTooltips === false) {
      return false;
    }

    const properties = olTooltip.getProperties() as any;
    const measure = properties._measure;
    if (measure === undefined) {
      return false;
    }

    if (properties._unit === MeasureType.Length) {
      const minSegmentLength =
        metersToUnit(this.minSegmentLength, properties._unit) || 0;
      return measure > Math.max(minSegmentLength, 0);
    }

    return true;
  }

  private saveCurrentUnits() {
    this.storageService.set(
      'distanceUnit',
      this.activeLengthUnit,
      StorageScope.SESSION
    );
    this.storageService.set(
      'areaUnit',
      this.activeAreaUnit,
      StorageScope.SESSION
    );
  }

  private getSavedUnits() {
    const distanceUnit = this.storageService.get(
      'distanceUnit'
    ) as MeasureLengthUnit;
    const areaUnit = this.storageService.get('areaUnit') as MeasureAreaUnit;

    this.activeLengthUnit = distanceUnit ? distanceUnit : this.activeLengthUnit;
    this.activeAreaUnit = areaUnit ? areaUnit : this.activeAreaUnit;
  }
}
