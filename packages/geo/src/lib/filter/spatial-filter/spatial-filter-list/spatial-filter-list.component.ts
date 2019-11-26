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

  public formControl = new FormControl();

  @Output() zoneChange = new EventEmitter<Feature>();

  formValueChanges$$: Subscription;

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
  }

  ngOnDestroy() {
    this.formValueChanges$$.unsubscribe();
  }

  displayFn(feature?: Feature): string | undefined {
    return feature ? feature.properties.nom : undefined;
  }

  constructor(private spatialFilterService: SpatialFilterService) {}

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
