import OlFeature from 'ol/Feature';
import type { default as OlGeometry } from 'ol/geom/Geometry';

import { FeatureDataSource } from '../../datasource/shared/datasources';
import {
  Feature,
  FeatureMotion,
  featureToOl,
  moveToOlFeatures
} from '../../feature/shared';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import type { MapBase } from '../../map/shared/map.abstract';
import { createOverlayLayer } from './overlay.utils';

/**
 * This class is simply a shortcut for adding features to a map.
 * It does nothing more than a standard layer but it's shipped with
 * a defautl style based on the geometry type of the features it contains.
 * @todo Enhance that by using a FeatureStore and strategies.
 */
export class Overlay<T extends MapBase = MapBase> {
  /**
   * The map to add the layer to
   */
  private map: T;

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

  constructor(map?: T) {
    this.layer = createOverlayLayer();
    this.setMap(map);
  }

  /**
   * Bind this to a map and add the overlay layer to that map
   * @param map Map
   */
  setMap(map: T) {
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
   * @param sourceId Optional: Remove features of certain sourceId (ex: 'Map' for query features)
   */
  setFeatures(
    features: Feature[],
    motion: FeatureMotion = FeatureMotion.Default,
    sourceId?: string
  ) {
    if (sourceId) {
      for (const olFeature of this.dataSource.ol.getFeatures()) {
        if (olFeature.get('_sourceId') === sourceId) {
          this.removeOlFeature(olFeature);
        }
      }
    } else {
      this.clear();
    }
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
    olFeature: OlFeature<OlGeometry>,
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
    olFeatures: OlFeature<OlGeometry>[],
    motion: FeatureMotion = FeatureMotion.Default
  ) {
    this.dataSource.ol.addFeatures(olFeatures);
    moveToOlFeatures(this.map.viewController, olFeatures, motion);
  }

  /**
   * Remove a feature from the overlay
   * @param feature Feature
   */
  removeFeature(feature: Feature) {
    this.removeFeatures([feature]);
  }

  /**
   * Remove features from the overlay
   * @param features Features
   */
  removeFeatures(features: Feature[]) {
    features.forEach((feature: Feature) => {
      if (feature.meta) {
        if (this.dataSource.ol.getFeatureById(feature.meta.id)) {
          this.removeOlFeature(
            this.dataSource.ol.getFeatureById(feature.meta.id)
          );
        }
      }
    });
  }

  /**
   * Remove an OpenLayers feature from the overlay
   * @param olFeature OpenLayers Feature
   */
  removeOlFeature(olFeature: OlFeature<OlGeometry>) {
    this.dataSource.ol.removeFeature(olFeature);
  }

  /**
   * Clear the overlay
   */
  clear() {
    this.dataSource.ol.clear();
  }
}
