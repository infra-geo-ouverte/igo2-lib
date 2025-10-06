import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToolComponent } from '@igo2/common/tool';
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
  imports: [MeasurerComponent]
})
export class MeasurerToolComponent {
  private measureState = inject(MeasureState);
  private mapState = inject(MapState);

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
}
