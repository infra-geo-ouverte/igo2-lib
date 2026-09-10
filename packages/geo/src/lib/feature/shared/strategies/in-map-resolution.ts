import { EntityStore, EntityStoreStrategy } from '@igo2/common/entity';

import { Subscription, debounceTime } from 'rxjs';

import { FeatureStoreInMapResolutionStrategyOptions } from '../feature.interfaces';
import { FeatureStore } from '../store';

/**
 * This strategy maintain the store features updated while the map is scrolled.
 * The features's state inside the map's resolution are tagged inMapResolution = true;
 */
export class FeatureStoreInMapResolutionStrategy extends EntityStoreStrategy {
  /**
   * Subscription to the store's OL source changes
   */
  private stores$$ = new Map<FeatureStore, Subscription>();

  constructor(protected options: FeatureStoreInMapResolutionStrategyOptions) {
    super(options);
  }

  /**
   * Bind this strategy to a store and start watching for Ol source changes
   * @param store Feature store
   */
  bindStore(store: EntityStore) {
    super.bindStore(store);
    const featureStore = store as unknown as FeatureStore;
    if (this.active === true) {
      this.watchStore(featureStore);
    }
  }

  /**
   * Unbind this strategy from a store and stop watching for Ol source changes
   * @param store Feature store
   */
  unbindStore(store: EntityStore) {
    super.unbindStore(store);
    this.unwatchStore(store as FeatureStore);
  }

  /**
   * Start watching all stores already bound to that strategy at once.
   * @internal
   */
  protected doActivate() {
    this.stores.forEach((store) => this.watchStore(store as FeatureStore));
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

    this.updateEntitiesInResolution(
      store,
      store.map.viewController.getResolution()
    );
    const subscription = new Subscription();
    subscription.add(
      store.map.viewController.resolution$
        .pipe(debounceTime(250))
        .subscribe((res) => {
          this.updateEntitiesInResolution(store, res);
        })
    );
    subscription.add(
      store.empty$.subscribe(() =>
        this.updateEntitiesInResolution(
          store,
          store.map.viewController.getResolution()
        )
      )
    );
    this.stores$$.set(store, subscription);
  }

  private updateEntitiesInResolution(
    store: FeatureStore,
    mapResolution: number | undefined
  ) {
    if (
      (mapResolution ?? 0) > store.layer.minResolution &&
      (mapResolution ?? 0) < store.layer.maxResolution
    ) {
      store.state.updateAll({ inMapResolution: true });
    } else {
      store.state.updateAll({ inMapResolution: false });
    }
  }

  /**
   * Stop watching for a store's OL source changes
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
   * Stop watching for OL source changes in all stores.
   */
  private unwatchAll() {
    Array.from(this.stores$$.keys()).forEach((store) =>
      this.unwatchStore(store)
    );
  }
}
