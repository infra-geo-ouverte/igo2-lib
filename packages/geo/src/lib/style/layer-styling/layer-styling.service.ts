import { Injectable } from '@angular/core';

import { GeoJSON } from 'ol/format';
import { GeoJSONFeatureCollection } from 'ol/format/GeoJSON';

import { Style as GsStyle } from 'geostyler-style';
import { BehaviorSubject } from 'rxjs';

import { VectorLayer } from '../../layer/shared/layers/vector-layer';

@Injectable()
export class LayerStylingService {
  private selectedLayer$$ = new BehaviorSubject<VectorLayer | null>(null);
  private layerData$$ = new BehaviorSubject<GeoJSONFeatureCollection | null>(
    null
  );
  // private layerStyle$ = new BehaviorSubject<GsStyle | null>(null);

  selectedLayer$ = this.selectedLayer$$.asObservable();
  layerData$ = this.layerData$$.asObservable();

  selectLayer(layer: VectorLayer): void {
    this.selectedLayer$$.next(layer);
    this.loadFeaturesFromLayer(layer);
  }

  updateLayerStyle(style: GsStyle): void {
    const layer = this.selectedLayer$$.getValue();
    if (layer) {
      layer.style = {
        type: 'Geostyler',
        style
      };
    }
  }

  private loadFeaturesFromLayer(layer: VectorLayer): void {
    layer.dataSource.ol.once('featuresloadend', () => {
      // todo: DEFENSIVE check
      const features = layer.dataSource.ol.getFeatures();
      const geojson = new GeoJSON().writeFeaturesObject(features);
      this.layerData$$.next(geojson);
    });
  }
}
