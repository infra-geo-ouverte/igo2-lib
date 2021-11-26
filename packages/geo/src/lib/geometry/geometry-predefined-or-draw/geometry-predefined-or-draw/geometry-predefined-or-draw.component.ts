import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter
} from '@angular/core';

import { FormControl } from '@angular/forms';
import { Layer, VectorLayer } from '../../../layer';

import { SpatialType, PredefinedType } from '../shared/geometry-predefined-or-draw.enum';
import { EntityStore } from '@igo2/common';
import { IgoMap } from '../../../map/shared/map';
import { FeatureForPredefinedOrDrawGeometry } from '../shared/geometry-predefined-or-draw.interface';
import { FeatureDataSource } from '../../../datasource/shared/datasources/feature-datasource';
import { zoneStyle } from '../shared/geometry-predefined-or-draw.utils';
import { tryBindStoreLayer } from '../../../feature/shared/feature.utils';
import { FeatureStoreLoadingStrategy } from '../../../feature/shared/strategies/loading';
import { FeatureMotion } from '../../../feature/shared/feature.enums';
import { tryAddLoadingStrategy } from '../../../feature/shared/strategies.utils';
import { FeatureStore } from '../../../feature/shared/store';

@Component({
  selector: 'igo-geometry-predefined-or-draw',
  templateUrl: './geometry-predefined-or-draw.component.html',
  styleUrls: ['./geometry-predefined-or-draw.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeometryPredefinedOrDrawTypeComponent implements OnInit {

  @Input() predefinedRegionsStore: EntityStore<FeatureForPredefinedOrDrawGeometry>
  @Input() currentRegionStore: FeatureStore<FeatureForPredefinedOrDrawGeometry>
  @Input() predefinedTypes: string[] = [];
  @Input() minBufferMeters: number = 0;
  @Input() maxBufferMeters: number = 100000;
  @Input() selectedPredefinedType: PredefinedType;

  @Input() layers: Layer[] = [];
  @Input() map: IgoMap;

  public selectedTypeIndex = new FormControl(0);
  public predefinedOrDrawType: SpatialType = SpatialType.Polygon;

  @Output() predefinedTypeChange = new EventEmitter<PredefinedType>();
  @Output() zoneChange = new EventEmitter<FeatureForPredefinedOrDrawGeometry>();

  constructor() {}

  ngOnInit() {
    this.initCurrentZoneStore();
    this.onPredefinedOrDrawTypeChange();
  }

  private initCurrentZoneStore() {
    const layer = new VectorLayer({
      id: 'currentZone',
      title: 'Current zone',
      zIndex: 900,
      source: new FeatureDataSource(),
      showInLayerList: false,
      exportable: false,
      browsable: false,
      style: zoneStyle,
      workspace: {enabled: false}
    });

    tryBindStoreLayer(this.currentRegionStore, layer);
    const loadingStrategy = new FeatureStoreLoadingStrategy({
      motion: FeatureMotion.None
    });
    tryAddLoadingStrategy(this.currentRegionStore, loadingStrategy);
  }


  onPredefinedOrDrawTypeChange() {
    if (this.selectedTypeIndex.value === 0) {
      this.predefinedOrDrawType = SpatialType.Predefined;
    }
    if (this.selectedTypeIndex.value === 1) {
      this.predefinedOrDrawType = SpatialType.Polygon;
    }
    this.currentRegionStore.clear();
    this.currentRegionStore.clearLayer();
  }
}
