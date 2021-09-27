import { Injectable } from '@angular/core';
import { EntityStore } from '@igo2/common';

import { FeatureStore, FeatureWithStop, Stop } from '@igo2/geo';
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
   public stopsFeatureStore: FeatureStore = new FeatureStore<FeatureWithStop>([], {
    map: this.mapState.map
  });

  /**
   * Store that holds the driving route
   */
  public routeFeatureStore: FeatureStore = new FeatureStore<FeatureWithStop>([], {
    map: this.mapState.map
  });

  public activeRouteDescription: string;

  public routeFromFeatureDetail = false;

  constructor(private mapState: MapState) {

  /*  this.mapState.map.layers$.subscribe(() => {
      if (!this.mapState.map.getLayerById('igo-direction-stops-layer')) {
       // this.stopsStore.deleteMany(this.stopsStore.all());
        this.directionsFormService.setStops([]);
      }
      if (!this.mapState.map.getLayerById('igo-direction-route-layer')) {
        this.routeStore.deleteMany(this.routeStore.all());
      }
    });*/
  }

  setRouteFromFeatureDetail(value: boolean) {
    this.routeFromFeatureDetail = value;
  }

}
