import { EntityStoreStrategy } from '@igo2/common';

import OlEvent from 'ol/events/Event';

import { ClusterDataSource } from '../../../datasource/shared/datasources/cluster-datasource';
import { FeatureStoreLoadingLayerStrategyOptions } from '../feature.interfaces';
import { FeatureStore } from '../store';

/**
 * This strategy loads a layer's features into it's store counterpart.
 * The layer -> store binding is a one-way binding. That means any OL feature
 * added to the layer will be added to the store but the opposite is false.
 *
 * Important: In it's current state, this strategy is to meant to be combined
 * with a standard Loading strategy and it would probably cause recursion issues.
 */
export class FeatureStoreLoadingLayerStrategy extends EntityStoreStrategy {
  /**
   * Subscription to the store's OL source changes
   */
  private stores$$ = new Map<FeatureStore, string>();

  constructor(protected options: FeatureStoreLoadingLayerStrategyOptions) {
    super(options);
  }

  /**
   * Bind this strategy to a store and start watching for Ol source changes
   * @param store Feature store
   */
  bindStore(store: FeatureStore) {
    super.bindStore(store);
    if (this.active === true) {
      this.watchStore(store);
    }
  }

  /**
   * Unbind this strategy from a store and stop watching for Ol source changes
   * @param store Feature store
   */
  unbindStore(store: FeatureStore) {
    super.unbindStore(store);
    if (this.active === true) {
      this.unwatchStore(store);
    }
  }

  /**
   * Start watching all stores already bound to that strategy at once.
   * @internal
   */
  protected doActivate() {
    this.stores.forEach((store: FeatureStore) => this.watchStore(store));
  }

  /**
   * Stop watching all stores bound to that strategy
   * @internal
   */
  protected doDeactivate() {
    this.unwatchAll();
  }

  /**
   * Watch for a store's  OL source changes
   * @param store Feature store
   */
  private watchStore(store: FeatureStore) {
    if (this.stores$$.has(store)) {
      return;
    }

    this.onSourceChanges(store);
    const olSource = store.layer.ol.getSource();
    olSource.on('change', (event: OlEvent) => {
      this.onSourceChanges(store);
    });
  }

  /**
   * Stop watching for a store's OL source changes
   * @param store Feature store
   */
  private unwatchStore(store: FeatureStore) {
    const key = this.stores$$.get(store);
    if (key !== undefined) {
      this.stores$$.delete(store);
    }
  }

  /**
   * Stop watching for OL source changes in all stores.
   */
  private unwatchAll() {
    Array.from(this.stores$$.entries()).forEach(
      (entries: [FeatureStore, string]) => {}
    );
    this.stores$$.clear();
  }

  /**
   * Load features from an OL source into a  store or clear the store if the source is empty
   * @param features Store filtered features
   * @param store Feature store
   */
  private onSourceChanges(store: FeatureStore) {
    let olFeatures = store.layer.ol.getSource().getFeatures();

    if (store.layer.dataSource instanceof ClusterDataSource) {
      olFeatures = (olFeatures as any).flatMap((cluster: any) =>
        cluster.get('features')
      );
    }
    if (olFeatures.length === 0) {
      store.clear();
    } else {
      store.setStoreOlFeatures(olFeatures);
    }
  }
}
