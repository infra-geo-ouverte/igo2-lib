import { Injectable } from '@angular/core';

import {
  RoutesFeatureStore,
  StepFeatureStore,
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

  public stepFeatureStore: StepFeatureStore;

  public debounceTime = 200;

  constructor(private mapState: MapState) {
    this.stopsFeatureStore = new StopsFeatureStore([], {
      map: this.mapState.map
    });

    this.routesFeatureStore = new RoutesFeatureStore([], {
      map: this.mapState.map
    });

    this.stepFeatureStore = new StepFeatureStore([], {
      map: this.mapState.map
    });

    this.mapState.map.ol.once('rendercomplete', () => {
      this.stopsFeatureStore.empty$.subscribe((empty) =>
        this.toggleLayer(this.stopsFeatureStore, empty)
      );
      this.routesFeatureStore.empty$.subscribe((empty) =>
        this.toggleLayer(this.routesFeatureStore, empty)
      );
    });

    this.mapState.map.layerController.all$.subscribe(() => {
      if (!this.mapState.map.getLayerById('igo-direction-stops-layer')) {
        this.stopsStore.deleteMany(this.stopsStore.all());
        this.stopsFeatureStore.deleteMany(this.stopsFeatureStore.all()); // not necessary
      }
      if (!this.mapState.map.getLayerById('igo-direction-route-layer')) {
        this.routesFeatureStore.deleteMany(this.routesFeatureStore.all());
      }
    });
  }

  private toggleLayer(
    store: RoutesFeatureStore | StopsFeatureStore,
    isEmpty: boolean
  ) {
    if (!store.layer) {
      return;
    }
    const layerId = store.layer.id;
    const layerController = store.map.layerController;
    isEmpty
      ? layerController.removeSystemToTree(layerId)
      : layerController.addSystemToTree(layerId);
  }
}
