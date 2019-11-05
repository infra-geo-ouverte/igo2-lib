import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter
} from '@angular/core';
import { SpatialFilterQueryType, SpatialFilterType } from '../../shared/spatial-filter.enum';
import { FormControl } from '@angular/forms';
import { EntityStore } from '@igo2/common';
import { Feature } from '../../../feature';

/**
 * Spatial Filter Type
 */
@Component({
  selector: 'igo-spatial-filter-type',
  templateUrl: './spatial-filter-type.component.html',
  styleUrls: ['./spatial-filter-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpatialFilterTypeComponent implements OnInit {

  @Input()
  get store(): EntityStore<Feature> {
    return this._store;
  }
  set store(store: EntityStore<Feature>) {
    this._store = store;
  }
  private _store: EntityStore<Feature>;

  @Input()
  get clearSearch(): boolean {
    return this._clearSearch;
  }
  set clearSearch(clearSearch: boolean) {
    this._clearSearch = clearSearch;
    this.selectedQueryType = undefined;
    this.eventQueryType.emit(this.selectedQueryType);
    this.zoneChange.emit(undefined);
  }
  private _clearSearch: boolean;

  public queryType: string[] = ['AdmRegion', 'Mun', 'Arrond', 'CircFed', 'CircProv', 'DirReg', 'MRC', 'RegTour'];
  public selectedTypeIndex = new FormControl(0);
  @Input() selectedQueryType: SpatialFilterQueryType;

  public type: SpatialFilterType;

  @Output() eventType = new EventEmitter<SpatialFilterType>();

  @Output() eventQueryType = new EventEmitter<SpatialFilterQueryType>();

  @Output() zoneChange = new EventEmitter<Feature>();

  constructor() {}

  ngOnInit() {
    if (this.selectedTypeIndex.value === 0) {
      this.type = SpatialFilterType.Predefined;
    }
    if (this.selectedTypeIndex.value === 1) {
      this.type = SpatialFilterType.Polygon;
    }
    if (this.selectedTypeIndex.value === 2) {
      this.type = SpatialFilterType.Point;
    }
    this.eventType.emit(this.type);
  }

  onTypeChange(event) {
    if (this.selectedTypeIndex.value === 0) {
      this.type = SpatialFilterType.Predefined;
    }
    if (this.selectedTypeIndex.value === 1) {
      this.type = SpatialFilterType.Polygon;
    }
    if (this.selectedTypeIndex.value === 2) {
      this.type = SpatialFilterType.Point;
    }
    this.eventType.emit(this.type);
  }

  onQueryTypeChange(event) {
    this.eventQueryType.emit(this.selectedQueryType);
  }

  onZoneChange(feature) {
    this.zoneChange.emit(feature);
  }
}
