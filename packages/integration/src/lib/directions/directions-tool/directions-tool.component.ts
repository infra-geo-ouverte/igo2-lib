import { Component } from '@angular/core';

import { EntityStore, ToolComponent } from '@igo2/common';
import { IgoMap, FeatureStore, Stop } from '@igo2/geo';

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
   * stops
   * @internal
   */
  get stopsStore(): EntityStore<Stop> { return this.directionState.stopsStore; }

  /**
   * routes
   * @internal
   */
  get routeStore(): FeatureStore { return this.directionState.routeStore; }

  /**
   * Map to measure on
   * @internal
   */
  get map(): IgoMap { return this.mapState.map; }


  get routeFromFeatureDetail() {
    return this.directionState.routeFromFeatureDetail;
  }

  constructor(
    private directionState: DirectionState,
    private mapState: MapState
  ) {}

  onActiveRouteDescriptionChange(directions) {
    this.directionState.activeRouteDescription = directions;
  }

}
