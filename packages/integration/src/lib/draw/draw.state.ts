import { Injectable } from '@angular/core';

import { FeatureStore, Feature, DrawControl } from '@igo2/geo';
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
  public stores: FeatureStore<Feature>[] = [];

  public drawControls: DrawControl[];



  constructor(private mapState: MapState) {

    // this.mapState.map.layers$.subscribe(() => {

    //   if (!this.mapState.map.layers.find(layer => layer.id.includes('igo-draw-layer'))) {
    //     this.store.deleteMany(this.store.all());
    //   }
    // });
  }

}
