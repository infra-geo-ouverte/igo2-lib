import { Injectable, EventEmitter, Output } from '@angular/core';
import { EntityStore } from '@igo2/common';

import { DirectionsFormService, FeatureStore, Stop } from '@igo2/geo';
import { MapState } from '../map/map.state';

/**
 * Service that holds the state of the direction module
 */
@Injectable({
  providedIn: 'root'
})
export class DirectionState {

  /**
   * Store that holds the stop and the driving route
   */
  public stopsStore: EntityStore<Stop> = new EntityStore<Stop>([]);


  /**
   * Store that holds the driving route
   */
  public routeStore: FeatureStore = new FeatureStore([], {
    map: this.mapState.map
  });

  public activeRouteDescription: string;

  public routeFromFeatureDetail = false;

  constructor(
    private mapState: MapState,
    private directionsFormService: DirectionsFormService) {

    this.mapState.map.layers$.subscribe(() => {
      if (!this.mapState.map.getLayerById('igo-direction-stops-layer')) {
        this.stopsStore.deleteMany(this.stopsStore.all());
        this.directionsFormService.setStops([]);
      }
      if (!this.mapState.map.getLayerById('igo-direction-route-layer')) {
        this.routeStore.deleteMany(this.routeStore.all());
      }
    });
  }

  setRouteFromFeatureDetail(value: boolean) {
    this.routeFromFeatureDetail = value;
  }

}
