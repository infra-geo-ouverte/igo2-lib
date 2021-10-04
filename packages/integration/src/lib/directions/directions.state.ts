import { Injectable } from '@angular/core';
import { EntityRecord, EntityState } from '@igo2/common';

import { AnyLayerOptions, Stop, StopsStore, StopsFeatureStore, RoutesFeatureStore } from '@igo2/geo';
import { first, skipWhile } from 'rxjs/operators';
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
  public stopsStore: StopsStore = new StopsStore([]);

  /**
   * Store that holds the driving route
   */
  public stopsFeatureStore: StopsFeatureStore = new StopsFeatureStore([], {
    map: this.mapState.map
  });

  /**
   * Store that holds the driving route
   */
  public routesFeatureStore: RoutesFeatureStore = new RoutesFeatureStore([], {
    map: this.mapState.map
  });

  public activeRouteDescription: string;

  public routeFromFeatureDetail = false;

  constructor(private mapState: MapState) {

    this.stopsStore.stateView.all$()
    .pipe(
      skipWhile((stopsWithState: EntityRecord<Stop, EntityState>[]) => stopsWithState.filter(s => s.state.position === 1).length === 0 ),
      first()
    )
    .subscribe((stopsWithState: EntityRecord<Stop, EntityState>[]) => {
      console.log(stopsWithState);
    });

    this.mapState.map.ol.once('rendercomplete', () => {
      this.stopsFeatureStore.empty$.subscribe((empty) => {
        if (this.stopsFeatureStore.layer?.options) {
          (this.stopsFeatureStore.layer.options as AnyLayerOptions).showInLayerList = !empty;
        }
      });
      this.routesFeatureStore.empty$.subscribe((empty) => {
        if (this.routesFeatureStore.layer?.options) {
          (this.routesFeatureStore.layer.options as AnyLayerOptions).showInLayerList = !empty;
        }
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
