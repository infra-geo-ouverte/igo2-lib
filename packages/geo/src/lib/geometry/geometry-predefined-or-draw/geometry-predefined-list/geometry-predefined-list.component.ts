import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import olFeature from 'ol/Feature';
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  Output,
  EventEmitter
} from '@angular/core';
import { BehaviorSubject, combineLatest, Subject, Subscription } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { Feature, FEATURE, FeatureGeometry, FeatureMotion, FeatureStore, featureToOl, moveToOlFeatures } from '../../../feature';
import { MeasureLengthUnit } from '../../../measure/shared';
import { EntityStore } from '@igo2/common';
import { LanguageService, MessageService } from '@igo2/core';
import buffer from '@turf/buffer';
import { IgoMap } from '../../../map/shared/map';

import { Geometry } from 'ol/geom';
import OlGeoJSON from 'ol/format/GeoJSON';
import { FeatureForPredefinedOrDrawGeometry } from '../shared/geometry-predefined-or-draw.interface';


@Component({
  selector: 'igo-geometry-predefined-list',
  templateUrl: './geometry-predefined-list.component.html',
  styleUrls: ['./geometry-predefined-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeometryPredefinedListComponent implements OnInit, OnDestroy {
  @Input() reset$ = new Subject<void>();
  @Input() predefinedTypes: string[] = [];
  @Input() minBufferMeters: number = 0;
  @Input() maxBufferMeters: number = 100000;
  @Input() predefinedRegionsStore: EntityStore<FeatureForPredefinedOrDrawGeometry>;
  @Input() currentRegionStore: FeatureStore<FeatureForPredefinedOrDrawGeometry>;
  @Input() map: IgoMap;
  @Input()
  get selectedPredefinedType(): string {
    return this._selectedPredefinedType;
  }
  set selectedPredefinedType(queryType: string) {
    this.reset$.next();
    if (this.predefinedRegionsStore.empty) {
      this.predefinedTypeChange.emit(queryType);
    }
    this._selectedPredefinedType = queryType;
  }
  private _selectedPredefinedType: string;

  private metersValidator = [Validators.max(this.maxBufferMeters), Validators.min(this.minBufferMeters), Validators.required];
  private kilometersValidator = [Validators.max(this.maxBufferMeters/1000), Validators.min(this.minBufferMeters/1000), Validators.required];

  public selectedZone$: BehaviorSubject<FeatureForPredefinedOrDrawGeometry> = new BehaviorSubject(undefined);
  public measureUnit$: BehaviorSubject<MeasureLengthUnit> = new BehaviorSubject(MeasureLengthUnit.Meters);
  public regionsFormControl = new FormControl();
  public bufferFormControl = new FormControl(0, this.metersValidator);

  private formValueChanges$$: Subscription;
  private selectedZone$$: Subscription;
  private allValueChanges$$: Subscription;

  get measureUnits(): string[] {
    return [MeasureLengthUnit.Meters, MeasureLengthUnit.Kilometers];
  }

  @Output() predefinedTypeChange = new EventEmitter<string>();
  @Output() zoneChange = new EventEmitter<FeatureForPredefinedOrDrawGeometry>();

  constructor(
    private messageService: MessageService,
    private languageService: LanguageService) {}

  ngOnInit() {

    this.reset$.subscribe(() => this.regionsFormControl.reset());

    this.selectedZone$$ = this.selectedZone$
    .subscribe(zone => zone ? this.bufferFormControl.enable({emitEvent: false}): this.bufferFormControl.disable({emitEvent: false}));

    this.formValueChanges$$ = this.regionsFormControl.valueChanges.subscribe((value) => {
      if (value?.length) {
        this.predefinedRegionsStore.view.filter((feature) => {
          const filterNormalized = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const featureNameNormalized = feature.properties.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return featureNameNormalized.includes(filterNormalized);
        });
      }
    });

    this.allValueChanges$$ = combineLatest([
      this.bufferFormControl.valueChanges.pipe(startWith(0), debounceTime(500), distinctUntilChanged()),
      this.selectedZone$,
      this.measureUnit$])
      .subscribe((bunch: [bufferValue: number, zone: FeatureForPredefinedOrDrawGeometry, unit: MeasureLengthUnit]) => {
        const bufferValue: number = bunch[0];
        const zone: FeatureForPredefinedOrDrawGeometry = bunch[1];
        const unit: MeasureLengthUnit = bunch[2];

        const factor = unit === MeasureLengthUnit.Meters ? 1 : 1000;
        if (this.bufferFormControl.errors) {
          const deltaMin = Math.abs(this.bufferFormControl.value / factor - this.minBufferMeters);
          const deltaMax = Math.abs(this.bufferFormControl.value / factor - this.maxBufferMeters);
          this.messageService.alert(this.languageService.translate.instant('igo.geo.spatialFilter.bufferAlert'),
            this.languageService.translate.instant('igo.geo.spatialFilter.warning'));
          const bufferToApply = (deltaMax < deltaMin ? this.maxBufferMeters : this.minBufferMeters) / factor;
          this.bufferFormControl.setValue(bufferToApply, { emitEvent: true });
          return;
        }
        if (zone) {
          this.selectedZone$.value.properties._buffer = bufferValue;
          this.processZone(zone);
        }
      });
  }

  ngOnDestroy() {
    this.formValueChanges$$.unsubscribe();
    this.allValueChanges$$.unsubscribe();
    this.selectedZone$$.unsubscribe();
  }

  displayFn(feature?: Feature): string | undefined {
    return feature ? feature.properties.title : undefined;
  }

  onPredefinedTypeChange() {
    this.currentRegionStore.clear();
    this.currentRegionStore.clearLayer();
    this.predefinedTypeChange.emit(this.selectedPredefinedType);
    this.zoneChange.emit(undefined);
  }

  private processZone(feature: FeatureForPredefinedOrDrawGeometry) {
    if (feature && this.selectedPredefinedType) {
      this.bufferFormControl.enable({emitEvent: false});
      feature.properties._buffer = this.bufferFormControl.value;
      let currentZone = feature;
      if (feature.properties._buffer && feature.properties._buffer !== 0) {
        const bufferedZone = buffer(feature.geometry, feature.properties._buffer, { units: this.measureUnit$.value });

        bufferedZone.properties = feature.properties;
        currentZone = bufferedZone as FeatureForPredefinedOrDrawGeometry;
      }
      const myOlFeature: olFeature<Geometry> = featureToOl(currentZone, this.map.projection);

      const geojsonGeom = new OlGeoJSON().writeGeometryObject(myOlFeature.getGeometry(), {
        featureProjection: this.map.projection,
        dataProjection: this.map.projection
      }) as FeatureGeometry;

      const featureId = `${myOlFeature.getId()}.${this.bufferFormControl.value}`;
      const zoneFeature: FeatureForPredefinedOrDrawGeometry = {
        type: FEATURE,
        geometry: geojsonGeom,
        projection: this.map.projection,
        properties: {
          id: featureId,
          title: myOlFeature.get('title'),
          _predefinedType: this.selectedPredefinedType,
          _buffer: this.bufferFormControl.value
        },
        meta: {
          id: featureId
        },
        ol: myOlFeature
      };
      this.currentRegionStore.load([zoneFeature]);
      moveToOlFeatures(this.map, [myOlFeature], FeatureMotion.Zoom);
    }
  }

  onZoneChange(feature: FeatureForPredefinedOrDrawGeometry) {
    this.selectedZone$.next(feature);
  }

  /**
   * Set the measure unit
   * @internal
   */
  onMeasureUnitChange(unit: MeasureLengthUnit) {
    if(unit === MeasureLengthUnit.Meters) {
      this.bufferFormControl.setValidators(this.metersValidator);
    } else {
      this.bufferFormControl.setValidators(this.kilometersValidator);
    }
    if (unit === this.measureUnit$.value) {
      return;
    } else {
      this.measureUnit$.next(unit);
      this.measureUnit$.value === MeasureLengthUnit.Meters ?
        this.bufferFormControl.setValue(this.bufferFormControl.value * 1000) :
        this.bufferFormControl.setValue(this.bufferFormControl.value / 1000);
    }
  }
}
