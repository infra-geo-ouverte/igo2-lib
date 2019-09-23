import OlFeature from 'ol/Feature';

import {
  Feature,
  FeatureMotion,
  featureToOl,
  moveToOlFeatures
} from '../../feature';
import { FeatureDataSource } from '../../datasource';
import { VectorLayer } from '../../layer';
import { IgoMap } from '../../map';

import { createOverlayLayer } from './overlay.utils';

/**
 * This class is simply a shortcut for adding features to a map.
 * It does nothing more than a standard layer but it's shipped with
 * a defautl style based on the geometry type of the features it contains.
 * @todo Enhance that by using a FeatureStore and strategies.
 */
export class Overlay {
  /**
   * The map to add the layer to
   */
  private map: IgoMap;

  /**
   * Overlay layer
   */
  private layer: VectorLayer;

  /**
   * Overlay layer's data source
   */
  get dataSource(): FeatureDataSource {
    return this.layer.dataSource as FeatureDataSource;
  }

  constructor(map?: IgoMap) {
    this.layer = createOverlayLayer();
    this.setMap(map);
  }

  /**
   * Bind this to a map and add the overlay layer to that map
   * @param map Map
   */
  setMap(map: IgoMap) {
    if (map === undefined) {
      if (this.map !== undefined) {
        this.map.ol.removeLayer(this.layer.ol);
      }
    } else {
      map.ol.addLayer(this.layer.ol);
    }
    this.map = map;
  }

  /**
   * Set the overlay features and, optionally, move to them
   * @param features Features
   * @param motion Optional: Apply this motion to the map view
   */
  setFeatures(
    features: Feature[],
    motion: FeatureMotion = FeatureMotion.Default
  ) {
    this.clear();
    this.addFeatures(features, motion);
  }

  /**
   * Add a feature to the  overlay and, optionally, move to it
   * @param feature Feature
   * @param motion Optional: Apply this motion to the map view
   */
  addFeature(feature: Feature, motion: FeatureMotion = FeatureMotion.Default) {
    this.addFeatures([feature], motion);
  }

  /**
   * Add features to the  overlay and, optionally, move to them
   * @param features Features
   * @param motion Optional: Apply this motion to the map view
   */
  addFeatures(
    features: Feature[],
    motion: FeatureMotion = FeatureMotion.Default
  ) {
    const olFeatures = [];
    features.forEach((feature: Feature) => {
      const olFeature = featureToOl(feature, this.map.projection);
      const olGeometry = olFeature.getGeometry();
      if (olGeometry === null) {
        return;
      }
      olFeatures.push(olFeature);
    });

    this.addOlFeatures(olFeatures, motion);
  }

  /**
   * Add a OpenLayers feature to the  overlay and, optionally, move to it
   * @param olFeature OpenLayers Feature
   * @param motion Optional: Apply this motion to the map view
   */
  addOlFeature(
    olFeature: OlFeature,
    motion: FeatureMotion = FeatureMotion.Default
  ) {
    this.addOlFeatures([olFeature], motion);
  }

  /**
   * Add OpenLayers features to the overlay and, optionally, move to them
   * @param olFeatures OpenLayers Features
   * @param motion Optional: Apply this motion to the map view
   */
  addOlFeatures(
    olFeatures: OlFeature[],
    motion: FeatureMotion = FeatureMotion.Default
  ) {
    this.dataSource.ol.addFeatures(olFeatures);
    moveToOlFeatures(this.map, olFeatures, motion);
  }

  /**
   * Clear the overlay
   */
  clear() {
    this.dataSource.ol.clear();
  }
}
