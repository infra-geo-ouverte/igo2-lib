import { Injectable } from '@angular/core';

import { FeatureStore, FeatureWithMeasure } from '@igo2/geo';
import { MapState } from '../map/map.state';

/**
 * Service that holds the state of the measure module
 */
@Injectable({
  providedIn: 'root'
})
export class MeasureState {

  /**
   * Store that holds the measures
   */
  public store: FeatureStore<FeatureWithMeasure> = new FeatureStore<FeatureWithMeasure>([], {
    map: this.mapState.map
  });

  constructor(private mapState: MapState) {}

}
