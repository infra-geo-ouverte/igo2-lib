import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { IgoMap, RoutesFeatureStore, StopsFeatureStore, StopsStore } from '@igo2/geo';

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
  get stopsStore(): StopsStore { return this.directionState.stopsStore; }

  get debounceTime(): number { return this.directionState.debounceTime; }

  /**
   * stops
   * @internal
   */
   get stopsFeatureStore(): StopsFeatureStore { return this.directionState.stopsFeatureStore; }

  /**
   * routes
   * @internal
   */
  get routesFeatureStore(): RoutesFeatureStore { return this.directionState.routesFeatureStore; }

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
