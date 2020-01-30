import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { IgoMap, FeatureStore } from '@igo2/geo';

import { MapState } from '../../map/map.state';
import { DirectionState } from '../directions.state';

@ToolComponent({
  name: 'directions',
  title: 'igo.integration.tools.directions',
  icon: 'directions'
})
@Component({
  selector: 'igo-directions-tool',
  templateUrl: './directions-tool.component.html'
})
export class DirectionsToolComponent {
  /**
   * Map to measure on
   * @internal
   */
  get store(): FeatureStore { return this.directionState.store; }

  /**
   * Map to measure on
   * @internal
   */
  get map(): IgoMap { return this.mapState.map; }

  constructor(
    private directionState: DirectionState,
    private mapState: MapState
  ) {}

}