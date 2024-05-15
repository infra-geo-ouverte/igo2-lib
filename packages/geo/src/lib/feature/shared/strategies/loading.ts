import { EntityStoreStrategy } from '@igo2/common/entity';

import { Subscription } from 'rxjs';

import { FeatureMotion } from '../feature.enums';
import {
  Feature,
  FeatureStoreLoadingStrategyOptions
} from '../feature.interfaces';
import { FeatureStore } from '../store';

/**
 * This strategy loads a store's features into it's layer counterpart.
 * The store -> layer binding is a one-way binding. That means any entity
 * added to the store will be added to the layer but the opposite is false.
 *
 * Important: This strategy observes filtered entities, not raw entities. This
 * is not configurable yet.
 */
export class FeatureStoreLoadingStrategy extends EntityStoreStrategy {
  /**
   * Subscription to the store's features
   */
  private stores$$ = new Map<FeatureStore, Subscription>();

  private motion: FeatureMotion;

  constructor(protected options: FeatureStoreLoadingStrategyOptions) {
    super(options);
    this.setMotion(options.motion);
  }

  /**
   * Bind this strategy to a store and start watching for entities changes
   * @param store Feature store
   */
  bindStore(store: FeatureStore) {
    super.bindStore(store);
    if (this.active === true) {
      this.watchStore(store);
    }
  }

  /**
   * Unbind this strategy from a store and stop watching for entities changes
   * @param store Feature store
   */
  unbindStore(store: FeatureStore) {
    super.unbindStore(store);
    if (this.active === true) {
      this.unwatchStore(store);
    }
  }

  /**
   * Define the motion to apply on load
   * @param motion Feature motion
   */
  setMotion(motion: FeatureMotion) {
    this.motion = motion;
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
   * Watch for entities changes in a store.
   * Important: Never observe a store's sorted entities. It makes no sense
   * to display sorted entities (instead of unsorted) on a layer and it
   * would potentially result in a lot of useless computation.
   * @param store Feature store
   */
  private watchStore(store: FeatureStore) {
    if (this.stores$$.has(store)) {
      return;
    }

    const subscription = store.view
      .all$()
      .subscribe((features: Feature[]) =>
        this.onFeaturesChange(features, store)
      );
    this.stores$$.set(store, subscription);
  }

  /**
   * Stop watching for entities changes in a store.
   * @param store Feature store
   */
  private unwatchStore(store: FeatureStore) {
    const subscription = this.stores$$.get(store);
    if (subscription !== undefined) {
      subscription.unsubscribe();
      this.stores$$.delete(store);
    }
  }

  /**
   * Stop watching for entities changes in all stores.
   */
  private unwatchAll() {
    Array.from(this.stores$$.entries()).forEach(
      (entries: [FeatureStore, Subscription]) => {
        entries[1].unsubscribe();
      }
    );
    this.stores$$.clear();
  }

  /**
   * Load features into a layer or clear the layer if the array of features is empty.
   * @param features Store filtered features
   * @param store Feature store
   */
  private onFeaturesChange(features: Feature[], store: FeatureStore) {
    if (features.length === 0) {
      store.clearLayer();
    } else {
      store.setLayerFeatures(
        features,
        this.selectMotion(store),
        this.options.viewScale,
        this.options.areaRatio,
        this.options.getFeatureId
      );
    }
  }

  /**
   * Selects the best motion
   * @param store A FeatureStore to apply the motion
   * @returns The motion selected
   */
  private selectMotion(store: FeatureStore) {
    if (this.motion !== undefined) {
      return this.motion;
    }

    if (store.pristine === true) {
      // If features have just been loaded into the store, move/zoom on them
      return FeatureMotion.Default;
    } else if (store.count > store.view.count) {
      // If features have been filtered, move/zoom on the remaining ones
      return FeatureMotion.Default;
    } else {
      // On insert, update or delete, do nothing
      return FeatureMotion.None;
    }
  }
}
