import { Injectable } from '@angular/core';
import { EntityStore } from '@igo2/common';

import { FeatureStore, FeatureWithDirection, FeatureWithStop, Stop } from '@igo2/geo';
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
   public stopsFeatureStore: FeatureStore<FeatureWithStop> = new FeatureStore<FeatureWithStop>([], {
    map: this.mapState.map
  });

  /**
   * Store that holds the driving route
   */
  public routesFeatureStore: FeatureStore<FeatureWithDirection> = new FeatureStore<FeatureWithDirection>([], {
    map: this.mapState.map
  });

  public activeRouteDescription: string;

  public routeFromFeatureDetail = false;

  constructor(private mapState: MapState) {

    this.mapState.map.ol.once('rendercomplete', () => {
      this.stopsFeatureStore.empty$.subscribe((empty) => {
        this.stopsFeatureStore.layer.options.showInLayerList = !empty;
      });
      this.routesFeatureStore.empty$.subscribe((empty) => {
        this.routesFeatureStore.layer.options.showInLayerList = !empty;
      });
    });

    this.mapState.map.layers$.subscribe(() => {
      if (!this.mapState.map.getLayerById('igo-direction-stops-layer')) {
       this.stopsStore.deleteMany(this.stopsStore.all());
       this.stopsFeatureStore.deleteMany(this.stopsFeatureStore.all()); // not necessary
      }
      if (!this.mapState.map.getLayerById('igo-direction-route-layer')) {
        this.routesFeatureStore.deleteMany(this.routesFeatureStore.all());
      }
    });
  }

  setRouteFromFeatureDetail(value: boolean) {
    this.routeFromFeatureDetail = value;
  }

}
