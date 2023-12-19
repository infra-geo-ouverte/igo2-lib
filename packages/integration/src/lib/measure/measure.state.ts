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
  public store: FeatureStore<FeatureWithMeasure>;

  constructor(private mapState: MapState) {
    this.store = new FeatureStore<FeatureWithMeasure>([], {
      map: this.mapState.map
    });

    this.mapState.map.layers$.subscribe((layers) => {
      if (
        layers.filter((l) => l.id?.startsWith('igo-measures-')).length === 0
      ) {
        this.store.deleteMany(this.store.all());
        this.mapState.map.ol
          .getOverlays()
          .getArray()
          .filter((overlay) =>
            (overlay as any).options.className.includes('igo-map-tooltip')
          )
          .map((overlay) => this.mapState.map.ol.removeOverlay(overlay));
      }
    });
  }
}
