import { Component } from '@angular/core';

import { EntityStore, ToolComponent } from '@igo2/common';
import { IgoMap, FeatureStore, Stop } from '@igo2/geo';
import { FeatureWithStop, FeatureWithDirection } from '@igo2/geo/lib/directions/shared/directions.interface';

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
   * stops
   * @internal
   */
   get stopsFeatureStore(): FeatureStore<FeatureWithStop> { return this.directionState.stopsFeatureStore; }

  /**
   * routes
   * @internal
   */
  get routesFeatureStore(): FeatureStore<FeatureWithDirection> { return this.directionState.routesFeatureStore; }

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
