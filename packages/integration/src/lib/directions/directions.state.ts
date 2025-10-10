import { Injectable, inject } from '@angular/core';

import {
  RoutesFeatureStore,
  StepsFeatureStore,
  StopsFeatureStore,
  StopsStore
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
  private mapState = inject(MapState);

  public zoomToActiveRoute$ = new Subject<void>();

  /**
   * Store that holds the stop
   */
  public stopsStore: StopsStore = new StopsStore([]);

  /**
   * Store that holds the driving stops as feature
   */
  public stopsFeatureStore: StopsFeatureStore;

  /**
   * Store that holds the driving route as feature
   */
  public routesFeatureStore: RoutesFeatureStore;

  public stepFeatureStore: StepsFeatureStore;

  public debounceTime = 200;

  constructor() {
    this.stopsFeatureStore = new StopsFeatureStore([], {
      map: this.mapState.map
    });

    this.routesFeatureStore = new RoutesFeatureStore([], {
      map: this.mapState.map
    });

    this.stepFeatureStore = new StepsFeatureStore([], {
      map: this.mapState.map
    });

    this.mapState.map.layerController.all$.subscribe(() => {
      if (
        !this.mapState.map.layerController.getById('igo-direction-stops-layer')
      ) {
        this.stopsStore.deleteMany(this.stopsStore.all());
        this.stopsFeatureStore.deleteMany(this.stopsFeatureStore.all()); // not necessary
      }
      if (
        !this.mapState.map.layerController.getById('igo-direction-route-layer')
      ) {
        this.routesFeatureStore.deleteMany(this.routesFeatureStore.all());
      }
    });
  }
}
