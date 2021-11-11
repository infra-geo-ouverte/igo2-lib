import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import olFeature from 'ol/Feature';
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { Feature, FEATURE, FeatureGeometry, FeatureMotion, FeatureStore, featureToOl, moveToOlFeatures } from '../../../feature';
import { MeasureLengthUnit } from '../../../measure/shared';
import { Layer } from '../../../layer';
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

  @Input() predefinedRegionsStore: EntityStore<FeatureForPredefinedOrDrawGeometry>
  @Input() currentRegionStore: FeatureStore<FeatureForPredefinedOrDrawGeometry>
  @Input() layers: Layer[] = [];
  @Input() map: IgoMap;
  @Input()
  get queryType(): string {
    return this._queryType;
  }
  set queryType(queryType: string) {
    this.formControl.setValue('');
    this._queryType = queryType;
  }
  private _queryType: string;

  @Input() minBufferMeters: number = 0;
  @Input() maxBufferMeters: number = 100000;

  private metersValidator = [Validators.max(this.maxBufferMeters), Validators.min(this.minBufferMeters), Validators.required];
  private kilometersValidator = [Validators.max(this.maxBufferMeters/1000), Validators.min(this.minBufferMeters/1000), Validators.required];

  public zoneWithBuffer;
  public selectedZone$: BehaviorSubject<FeatureForPredefinedOrDrawGeometry> = new BehaviorSubject(undefined);
  public measureUnit: MeasureLengthUnit = MeasureLengthUnit.Meters;
  public formControl = new FormControl();
  public bufferFormControl = new FormControl(0, this.metersValidator);
  private formValueChanges$$: Subscription;
  private selectedZone$$: Subscription;
  private bufferValueChanges$$: Subscription;

  get measureUnits(): string[] {
    return [MeasureLengthUnit.Meters, MeasureLengthUnit.Kilometers];
  }
  constructor(
    private messageService: MessageService,
    private languageService: LanguageService) {}

  ngOnInit() {

    this.selectedZone$$ = this.selectedZone$.subscribe(zone => zone ? this.bufferFormControl.enable(): this.bufferFormControl.disable());

    this.formValueChanges$$ = this.formControl.valueChanges.subscribe((value) => {
      if (value.length) {
        this.predefinedRegionsStore.view.filter((feature) => {
          const filterNormalized = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const featureNameNormalized = feature.properties.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return featureNameNormalized.includes(filterNormalized);
        });
      }
    });

    this.bufferValueChanges$$ = this.bufferFormControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe((value: number) => {
        if (this.bufferFormControl.errors) {
          this.messageService.alert(this.languageService.translate.instant('igo.geo.spatialFilter.bufferAlert'),
            this.languageService.translate.instant('igo.geo.spatialFilter.warning'));
          return;
        }
        this.selectedZone$.value.properties._buffer = value;
        this.onZoneChange(this.selectedZone$.value);
      });
  }

  ngOnDestroy() {
    this.formValueChanges$$.unsubscribe();
    this.bufferValueChanges$$.unsubscribe();
    this.selectedZone$$.unsubscribe();
  }

  displayFn(feature?: Feature): string | undefined {
    return feature ? feature.properties.title : undefined;
  }

  clearCurrentRegionStore() {
    this.currentRegionStore.clear();
    this.currentRegionStore.clearLayer();
  }

  onZoneChange(feature: FeatureForPredefinedOrDrawGeometry) {
    this.clearCurrentRegionStore();
    this.selectedZone$.next(feature);
    if (feature && this.queryType) {
      this.bufferFormControl.enable();
      feature.properties._buffer = this.bufferFormControl.value;
      let currentZone = feature;
      if (feature.properties._buffer && feature.properties._buffer !== 0) {
        const bufferedZone = buffer(feature.geometry, feature.properties._buffer, { units: this.measureUnit });

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
          _predefinedType: this.queryType,
          _buffer: this.bufferFormControl.value
        },
        meta: {
          id: featureId
        },
        ol: myOlFeature
      };

      this.clearCurrentRegionStore();
      this.currentRegionStore.load([zoneFeature]);
      moveToOlFeatures(this.map, [myOlFeature], FeatureMotion.Zoom);
    } else {
      this.clearCurrentRegionStore();
    }
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
    if (unit === this.measureUnit) {
      return;
    } else {
      this.measureUnit = unit;
      this.measureUnit === MeasureLengthUnit.Meters ?
        this.bufferFormControl.setValue(this.bufferFormControl.value * 1000) :
        this.bufferFormControl.setValue(this.bufferFormControl.value / 1000);
    }
  }
}
