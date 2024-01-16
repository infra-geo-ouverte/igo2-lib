import { EntityStoreStrategy } from '@igo2/common';

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
  private stores$$ = new Map<FeatureStore, string>();
  private resolution$$: Subscription[] = [];
  private empty$$: Subscription;

  constructor(protected options: FeatureStoreInMapResolutionStrategyOptions) {
    super(options);
  }

  /**
   * Bind this strategy to a store and start watching for Ol source changes
   * @param store Feature store
   */
  bindStore(store: FeatureStore) {
    if (!store && !store.layer && !store.layer.map) {
      return;
    }
    super.bindStore(store);
    if (this.active === true) {
      this.watchStore(store);
    }
    this.empty$$ = store.empty$.subscribe(() =>
      this.updateEntitiesInResolution(
        store,
        store.layer.map.viewController.getResolution()
      )
    );
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

    this.updateEntitiesInResolution(
      store,
      store.layer.map.viewController.getResolution()
    );
    this.resolution$$.push(
      store.layer.map.viewController.resolution$
        .pipe(debounceTime(250))
        .subscribe((res) => {
          this.updateEntitiesInResolution(store, res);
        })
    );
  }

  private updateEntitiesInResolution(store, mapResolution: number) {
    if (
      mapResolution > store.layer.minResolution &&
      mapResolution < store.layer.maxResolution
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
    const key = this.stores$$.get(store);
    if (key !== undefined) {
      this.stores$$.delete(store);
    }
  }

  /**
   * Stop watching for OL source changes in all stores.
   */
  private unwatchAll() {
    this.stores$$.clear();
    this.resolution$$.map((state) => state.unsubscribe());
    if (this.empty$$) {
      this.empty$$.unsubscribe();
    }
  }
}
