import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

import { EntityStore } from '@igo2/common';
import { MessageService } from '@igo2/core';

import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Feature } from '../../../feature';
import { Layer } from '../../../layer';
import { MeasureLengthUnit } from '../../../measure/shared';
import {
  SpatialFilterQueryType,
  SpatialFilterType
} from './../../shared/spatial-filter.enum';
import { SpatialFilterService } from './../../shared/spatial-filter.service';

@Component({
  selector: 'igo-spatial-filter-list',
  templateUrl: './spatial-filter-list.component.html',
  styleUrls: ['./spatial-filter-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpatialFilterListComponent implements OnInit, OnDestroy {
  @Input()
  get store(): EntityStore<Feature> {
    return this._store;
  }
  set store(store: EntityStore<Feature>) {
    this._store = store;
  }
  private _store: EntityStore<Feature>;

  @Input()
  get queryType(): SpatialFilterQueryType {
    return this._queryType;
  }
  set queryType(queryType: SpatialFilterQueryType) {
    this.formControl.setValue('');
    this._queryType = queryType;
  }
  private _queryType: SpatialFilterQueryType;

  @Input()
  get zone() {
    return this._zone;
  }
  set zone(value) {
    this._zone = value;
    if (!value) {
      this.zoneWithBuffer = undefined;
      this.bufferFormControl.setValue(0);
    }
  }
  private _zone;

  @Input() layers: Layer[] = [];

  public zoneWithBuffer;
  public selectedZone: any;

  public measureUnit: MeasureLengthUnit = MeasureLengthUnit.Meters;

  public formControl = new UntypedFormControl();

  public bufferFormControl = new UntypedFormControl();

  /**
   * Available measure units for the measure type given
   * @internal
   */
  get measureUnits(): string[] {
    return [MeasureLengthUnit.Meters, MeasureLengthUnit.Kilometers];
  }

  @Output() zoneChange = new EventEmitter<Feature>();
  @Output() zoneWithBufferChange = new EventEmitter<Feature>();
  @Output() bufferChange = new EventEmitter<number>();
  @Output() measureUnitChange = new EventEmitter<MeasureLengthUnit>();

  formValueChanges$$: Subscription;
  bufferValueChanges$$: Subscription;

  constructor(
    private spatialFilterService: SpatialFilterService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.formValueChanges$$ = this.formControl.valueChanges.subscribe(
      (value) => {
        if (value.length) {
          this.store.view.filter((feature) => {
            const filterNormalized = value
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '');
            const featureNameNormalized = feature.properties.nom
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '');
            return featureNameNormalized.includes(filterNormalized);
          });
        }
      }
    );

    this.bufferValueChanges$$ = this.bufferFormControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        if (
          this.measureUnit === MeasureLengthUnit.Meters &&
          value > 0 &&
          value <= 100000
        ) {
          this.bufferChange.emit(value);
          this.spatialFilterService
            .loadBufferGeometry(
              this.selectedZone,
              SpatialFilterType.Predefined,
              value,
              this.queryType
            )
            .subscribe((featureGeom: Feature) => {
              this.zoneWithBuffer = featureGeom;
              this.zoneWithBufferChange.emit(this.zoneWithBuffer);
            });
        } else if (
          this.measureUnit === MeasureLengthUnit.Kilometers &&
          value > 0 &&
          value <= 100
        ) {
          this.bufferChange.emit(value);
          this.spatialFilterService
            .loadBufferGeometry(
              this.selectedZone,
              SpatialFilterType.Predefined,
              value * 1000,
              this.queryType
            )
            .subscribe((featureGeom: Feature) => {
              this.zoneWithBuffer = featureGeom;
              this.zoneWithBufferChange.emit(this.zoneWithBuffer);
            });
        } else if (value === 0 && this.layers.length > 0) {
          this.bufferChange.emit(value);
          this.zoneWithBufferChange.emit(this.selectedZone);
        } else if (
          value < 0 ||
          (this.measureUnit === MeasureLengthUnit.Meters && value > 100000) ||
          (this.measureUnit === MeasureLengthUnit.Kilometers && value > 100)
        ) {
          this.bufferFormControl.setValue(0);
          this.messageService.alert(
            'igo.geo.spatialFilter.bufferAlert',
            'igo.geo.spatialFilter.warning'
          );
        }
      });
  }

  ngOnDestroy() {
    this.formValueChanges$$.unsubscribe();
  }

  displayFn(feature?: Feature): string | undefined {
    return feature ? feature.properties.nom : undefined;
  }

  onZoneChange(feature) {
    if (feature && this.queryType) {
      this.spatialFilterService
        .loadItemById(feature, this.queryType)
        .subscribe((featureGeom: Feature) => {
          this.selectedZone = featureGeom;
          this.zoneChange.emit(featureGeom);
        });
    }
  }

  /**
   * Set the measure unit
   * @internal
   */
  onMeasureUnitChange(unit: MeasureLengthUnit) {
    if (unit === this.measureUnit) {
      return;
    } else {
      this.measureUnit = unit;
      this.measureUnitChange.emit(this.measureUnit);
      this.measureUnit === MeasureLengthUnit.Meters
        ? this.bufferFormControl.setValue(this.bufferFormControl.value * 1000)
        : this.bufferFormControl.setValue(this.bufferFormControl.value / 1000);
    }
  }
}
