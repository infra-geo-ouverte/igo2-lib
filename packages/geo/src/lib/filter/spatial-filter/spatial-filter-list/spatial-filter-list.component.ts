import { EntityStore } from '@igo2/common';
import { SpatialFilterService } from './../../shared/spatial-filter.service';
import { SpatialFilterQueryType } from './../../shared/spatial-filter.enum';
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  Output,
  EventEmitter
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Feature } from '../../../feature';
import { MeasureLengthUnit } from '../../../measure/shared';

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

  @Input() selectedZone: Feature;

  public measureUnit: MeasureLengthUnit = MeasureLengthUnit.Meters;

  public formControl = new FormControl();

  public bufferFormControl = new FormControl();

  @Output() zoneChange = new EventEmitter<Feature>();
  @Output() bufferChange = new EventEmitter<number>();

  formValueChanges$$: Subscription;
  bufferValueChanges$$: Subscription;

  constructor(private spatialFilterService: SpatialFilterService) {}

  ngOnInit() {
    this.formValueChanges$$ = this.formControl.valueChanges.subscribe((value) => {
      if (value.length) {
        this.store.view.filter((feature) => {
          const filterNormalized = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const featureNameNormalized = feature.properties.nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return featureNameNormalized.includes(filterNormalized);
        });
      }
    });

    this.bufferValueChanges$$ = this.bufferFormControl.valueChanges.subscribe((value) => {
      if (value >= 0) {
        console.log(value);
        this.bufferChange.emit(value);
      } else {
        this.bufferFormControl.setValue(0);
      }
    })
  }

  ngOnDestroy() {
    this.formValueChanges$$.unsubscribe();
  }

  displayFn(feature?: Feature): string | undefined {
    return feature ? feature.properties.nom : undefined;
  }

  onZoneChange(feature) {
    if (feature && this.queryType) {
      this.spatialFilterService.loadItemById(feature, this.queryType)
      .subscribe((featureGeom: Feature) => {
        this.selectedZone = featureGeom;
        this.zoneChange.emit(featureGeom);
      });
    }
  }
}
