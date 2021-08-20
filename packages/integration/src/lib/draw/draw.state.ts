import { Injectable } from '@angular/core';

import { FeatureStore, Feature } from '@igo2/geo';
import { MapState } from '../map/map.state';

/**
 * Service that holds the state of the measure module
 */
@Injectable({
  providedIn: 'root'
})
export class DrawState {

  /**
   * Store that holds the measures
   */
  public store: FeatureStore<Feature> = new FeatureStore<Feature>([], {
    map: this.mapState.map
  });

  constructor(private mapState: MapState) {

    this.mapState.map.layers$.subscribe(() => {
      if (!this.mapState.map.getLayerById('igo-draw-layer')) {
        this.store.deleteMany(this.store.all());
      }
    });
  }

}
