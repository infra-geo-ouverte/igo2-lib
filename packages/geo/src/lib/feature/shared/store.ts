import { EntityKey, EntityStore, getEntityId } from '@igo2/common/entity';

import OlFeature from 'ol/Feature';
import * as olextent from 'ol/extent';
import type { default as OlGeometry } from 'ol/geom/Geometry';

import { Document } from 'flexsearch';

import { FeatureDataSource } from '../../datasource/shared/datasources';
import { VectorLayer } from '../../layer/shared';
import { IgoMap, MapExtent } from '../../map/shared';
import { FeatureMotion } from './feature.enums';
import { Feature, FeatureStoreOptions } from './feature.interfaces';
import {
  computeOlFeaturesDiff,
  computeOlFeaturesExtent,
  featureFromOl,
  featureToOl,
  moveToOlFeatures
} from './feature.utils';

/**
 * The class is a specialized version of an EntityStore that stores
 * features and the map layer to display them on. Synchronization
 * between the store and the layer is handled by strategies.
 */
export class FeatureStore<T extends Feature = Feature> extends EntityStore<T> {
  /**
   * Vector layer to display the features on
   */
  layer: VectorLayer;

  /**
   * The map the layer is bound to
   */
  readonly map: IgoMap;

  /**
   * The layer's data source
   */
  get source(): FeatureDataSource {
    return this.layer
      ? (this.layer.dataSource as FeatureDataSource)
      : undefined;
  }

  /**
   * The searchable index of loaded feature. Computed if strategy is provided
   */
  set searchDocument(v: Document<T>) {
    this._searchDocument = v;
  }

  get searchDocument(): Document<T> {
    return this._searchDocument;
  }
  private _searchDocument: Document<T>;

  constructor(entities: T[], options: FeatureStoreOptions) {
    super(entities, options);
    this.map = options.map;
  }

  /**
   * Bind this store to a vector layer
   * @param layer Vector layer
   * @returns Feature store
   */
  bindLayer(layer: VectorLayer): FeatureStore {
    this.layer = layer;
    return this;
  }

  /**
   * Set the layer's features and perform a motion to make them visible. Strategies
   * make extensive use of that method.
   * @param features Features
   * @param motion Optional: The type of motion to perform
   */
  setLayerFeatures(
    features: Feature[],
    motion: FeatureMotion = FeatureMotion.Default,
    viewScale?: [number, number, number, number],
    areaRatio?: number,
    getId?: (Feature) => EntityKey
  ) {
    getId = getId ? getId : getEntityId;
    this.checkLayer();

    const olFeatures = features.map((feature: Feature) =>
      featureToOl(feature, this.map.projection, getId)
    );
    this.setLayerOlFeatures(olFeatures, motion, viewScale, areaRatio);
  }

  /**
   * Set the store's features from an array of OL features.
   * @param olFeatures Ol features
   */
  setStoreOlFeatures(olFeatures: OlFeature<OlGeometry>[]) {
    this.checkLayer();

    const features = olFeatures.map((olFeature: OlFeature<OlGeometry>) => {
      olFeature.set('_featureStore', this, true);
      return featureFromOl(olFeature, this.layer.map.projection);
    });
    this.load(features as T[]);
  }

  /**
   * Remove all features from the layer
   */
  clearLayer() {
    this.checkLayer();
    this.source.ol.clear();
  }

  /**
   * Check wether a layer is bound or not and throw an error if not.
   */
  private checkLayer() {
    if (this.layer === undefined) {
      throw new Error('This FeatureStore is not bound to a layer.');
    }
  }

  /**
   * Set the layer's features and perform a motion to make them visible.
   * @param features Openlayers feature objects
   * @param motion Optional: The type of motion to perform
   */
  public setLayerOlFeatures(
    olFeatures: OlFeature<OlGeometry>[],
    motion: FeatureMotion = FeatureMotion.Default,
    viewScale?: [number, number, number, number],
    areaRatio?: number
  ) {
    const olSource = this.layer.ol.getSource();
    const diff = computeOlFeaturesDiff(olSource.getFeatures(), olFeatures);
    if (diff.remove.length > 0) {
      this.removeOlFeaturesFromLayer(diff.remove);
    }

    if (diff.add.length > 0) {
      this.addOlFeaturesToLayer(diff.add);
    }

    if (diff.add.length > 0) {
      // If features are added, do a motion toward the newly added features
      moveToOlFeatures(
        this.map.viewController,
        diff.add,
        motion,
        viewScale,
        areaRatio
      );
    } else if (diff.remove.length > 0) {
      // Else, do a motion toward all the features
      moveToOlFeatures(
        this.map.viewController,
        olFeatures,
        motion,
        viewScale,
        areaRatio
      );
    }
  }

  setLayerExtent(): void {
    let features = this.entities$.getValue();
    let extent = olextent.createEmpty() as MapExtent;
    let olFeatures = [];

    features.forEach((feature) => {
      olFeatures.push(featureToOl(feature, this.map.projection));
    });
    const featuresExtent = computeOlFeaturesExtent(
      olFeatures,
      this.map.viewProjection
    );
    olextent.extend(extent, featuresExtent);
    this.layer.setExtent(extent);
  }
  /**
   * Add features to the the layer
   * @param features Openlayers feature objects
   */
  private addOlFeaturesToLayer(olFeatures: OlFeature<OlGeometry>[]) {
    olFeatures.forEach((olFeature: OlFeature<OlGeometry>) => {
      olFeature.set('_featureStore', this, true);
    });
    this.source.ol.addFeatures(olFeatures);
  }

  /**
   * Remove features from the the layer
   * @param features Openlayers feature objects
   */
  private removeOlFeaturesFromLayer(olFeatures: OlFeature<OlGeometry>[]) {
    olFeatures.forEach((olFeature: OlFeature<OlGeometry>) => {
      this.source.ol.removeFeature(olFeature);
    });
  }
}
