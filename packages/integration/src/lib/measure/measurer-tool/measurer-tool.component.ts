import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import {
  FeatureStore,
  FeatureWithMeasure,
  IgoMap,
  MeasurerComponent
} from '@igo2/geo';

import { MapState } from '../../map/map.state';
import { MeasureState } from '../measure.state';

/**
 * Tool to measure lengths and areas
 */
@ToolComponent({
  name: 'measurer',
  title: 'igo.integration.tools.measurer',
  icon: 'square_foot'
})
@Component({
  selector: 'igo-measurer-tool',
  templateUrl: './measurer-tool.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MeasurerComponent]
})
export class MeasurerToolComponent {
  /**
   * Map to measure on
   * @internal
   */
  get store(): FeatureStore<FeatureWithMeasure> {
    return this.measureState.store;
  }

  /**
   * Map to measure on
   * @internal
   */
  get map(): IgoMap {
    return this.mapState.map;
  }

  constructor(
    private measureState: MeasureState,
    private mapState: MapState
  ) {}
}
