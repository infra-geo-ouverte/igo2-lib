import { Injectable } from '@angular/core';

import { FeatureStore, Feature, DrawControl, FeatureWithDraw } from '@igo2/geo';
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
  public stores: FeatureStore<FeatureWithDraw>[];

  public drawControls: [string, DrawControl][];

  constructor(private mapState: MapState) {

    this.mapState.map.layers$.subscribe(() => {
      if (this.stores){
        this.stores.forEach(store => {
          if (!this.mapState.map.layers.includes(store.layer)){
            store.deleteMany(store.all());
          }
        })
      }

    });
  }

}
