import { Injectable } from '@angular/core';

import { AnyLayerOptions, StopsStore, StopsFeatureStore, RoutesFeatureStore, StepFeatureStore } from '@igo2/geo';
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
   * Store that holds the stop
   */
  public stopsStore: StopsStore = new StopsStore([]);

  /**
   * Store that holds the driving stops as feature
   */
  public stopsFeatureStore: StopsFeatureStore = new StopsFeatureStore([], {
    map: this.mapState.map
  });

  /**
   * Store that holds the driving route as feature
   */
  public routesFeatureStore: RoutesFeatureStore = new RoutesFeatureStore([], {
    map: this.mapState.map
  });

  public stepFeatureStore: StepFeatureStore = new StepFeatureStore([], {
    map: this.mapState.map
  });

  public debounceTime: number = 200;

  constructor(private mapState: MapState) {

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

}
