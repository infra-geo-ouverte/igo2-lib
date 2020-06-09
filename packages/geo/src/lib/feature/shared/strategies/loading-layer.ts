import { unByKey } from 'ol/Observable';
import { OlEvent } from 'ol/events/Event';
import * as olextent from 'ol/extent';

import { EntityStoreStrategy } from '@igo2/common';

import { FeatureStore } from '../store';
import { FeatureStoreLoadingLayerStrategyOptions, Feature } from '../feature.interfaces';
import { Subscription } from 'rxjs';
import { ClusterDataSource } from '../../../datasource/shared/datasources/cluster-datasource';

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
  private states$$: Subscription[] = [];

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
      this.updateEntitiesInExtent(store);
    });

    this.states$$.push(store.layer.map.viewController.state$.subscribe(() => {
      this.updateEntitiesInExtent(store);
    }));
  }

  private updateEntitiesInExtent(store) {
    store.state.updateAll({ inMapExtent: false });
    const mapExtent = store.layer.map.viewController.getExtent();
    const entitiesInMapExtent = store.entities$.value
      .filter((entity: Feature) => olextent.intersects(entity.ol.getGeometry().getExtent(), mapExtent));
    if (entitiesInMapExtent.length > 0) {
      store.state.updateMany(entitiesInMapExtent, { inMapExtent: true }, true);
    }
  }

  /**
   * Stop watching for a store's OL source changes
   * @param store Feature store
   */
  private unwatchStore(store: FeatureStore) {
    const key = this.stores$$.get(store);
    if (key !== undefined) {
      unByKey(key);
      this.stores$$.delete(store);
    }
  }

  /**
   * Stop watching for OL source changes in all stores.
   */
  private unwatchAll() {
    Array.from(this.stores$$.entries()).forEach((entries: [FeatureStore, string]) => {
      unByKey(entries[1]);
    });
    this.stores$$.clear();
    this.states$$.map(state => state.unsubscribe());
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
