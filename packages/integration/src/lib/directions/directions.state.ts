import { Injectable } from '@angular/core';

import {
  AnyLayerOptions,
  WaypointStore,
  WaypointFeatureStore,
  RoutesFeatureStore,
  StepFeatureStore
} from '@igo2/geo';

import { Subject } from 'rxjs';

import { MapState } from '../map/map.state';

/**
 * Service that holds the state of the direction module
 */
@Injectable({
  providedIn: 'root'
})
export class DirectionState {
  public zoomToActiveRoute$: Subject<void> = new Subject();

  /**
   * Store that holds the waypoints
   */
  public waypointStore: WaypointStore = new WaypointStore([]);

  /**
   * Store that holds the driving waypoints as features
   */
  public waypointFeatureStore: WaypointFeatureStore;

  /**
   * Store that holds the driving route as feature
   */
  public routesFeatureStore: RoutesFeatureStore;

  public stepFeatureStore: StepFeatureStore;

  public debounceTime: number = 200;

  constructor(private mapState: MapState) {
    this.waypointFeatureStore = new WaypointFeatureStore([], {
      map: this.mapState.map
    });

    this.routesFeatureStore = new RoutesFeatureStore([], {
      map: this.mapState.map
    });

    this.stepFeatureStore = new StepFeatureStore([], {
      map: this.mapState.map
    });

    this.mapState.map.ol.once('rendercomplete', () => {
      this.waypointFeatureStore.empty$.subscribe((empty) => {
        if (this.waypointFeatureStore.layer?.options) {
          (
            this.waypointFeatureStore.layer.options as AnyLayerOptions
          ).showInLayerList = !empty;
        }
      });
      this.routesFeatureStore.empty$.subscribe((empty) => {
        if (this.routesFeatureStore.layer?.options) {
          (
            this.routesFeatureStore.layer.options as AnyLayerOptions
          ).showInLayerList = !empty;
        }
      });
    });

    this.mapState.map.layers$.subscribe(() => {
      if (!this.mapState.map.getLayerById('igo-direction-waypoint-layer')) {
        this.waypointStore.deleteMany(this.waypointStore.all());
        this.waypointFeatureStore.deleteMany(this.waypointFeatureStore.all()); // not necessary
      }
      if (!this.mapState.map.getLayerById('igo-direction-route-layer')) {
        this.routesFeatureStore.deleteMany(this.routesFeatureStore.all());
      }
    });
  }
}
