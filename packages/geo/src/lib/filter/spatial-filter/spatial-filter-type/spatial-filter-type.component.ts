import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

import { EntityStore } from '@igo2/common';

import { Feature } from '../../../feature';
import { Layer } from '../../../layer';
import { MeasureLengthUnit } from '../../../measure';
import {
  SpatialFilterQueryType,
  SpatialFilterType
} from '../../shared/spatial-filter.enum';

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

  public queryType: string[] = [
    'Arrond',
    'CircFed',
    'CircProv',
    'DirReg',
    'Mun',
    'MRC',
    'AdmRegion',
    'RegTour'
  ];
  public selectedTypeIndex = new UntypedFormControl(0);

  /**
   * Reference to the SpatialFIlterType enum
   * @internal
   */
  public spatialType = SpatialFilterType;

  public activeDrawType: SpatialFilterType = this.spatialType.Polygon;

  @Input() selectedQueryType: SpatialFilterQueryType;

  @Input() zone: Feature;

  @Input() layers: Layer[] = [];

  public type: SpatialFilterType;

  @Output() eventType = new EventEmitter<SpatialFilterType>();

  @Output() eventQueryType = new EventEmitter<SpatialFilterQueryType>();

  @Output() zoneChange = new EventEmitter<Feature>();
  @Output() zoneWithBufferChange = new EventEmitter<Feature>();

  @Output() bufferChange = new EventEmitter<number>();
  @Output() measureUnitChange = new EventEmitter<MeasureLengthUnit>();

  constructor() {}

  ngOnInit() {
    if (this.selectedTypeIndex.value === 0) {
      this.type = this.spatialType.Predefined;
    }
    if (this.selectedTypeIndex.value === 1) {
      this.type = this.activeDrawType;
    }
    this.eventType.emit(this.type);
  }

  onTypeChange(event) {
    if (this.selectedTypeIndex.value === 0) {
      this.type = SpatialFilterType.Predefined;
    }
    if (this.selectedTypeIndex.value === 1) {
      this.type = this.activeDrawType;
    }
    this.eventType.emit(this.type);
  }

  onDrawTypeChange(spatialType: SpatialFilterType) {
    this.activeDrawType = spatialType;
    this.eventType.emit(this.activeDrawType);
  }

  onSelectionChange() {
    this.eventQueryType.emit(this.selectedQueryType);
    this.zoneChange.emit(undefined);
  }
}
