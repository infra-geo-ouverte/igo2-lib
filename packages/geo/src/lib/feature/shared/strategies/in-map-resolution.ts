import { unByKey } from 'ol/Observable';

import { EntityStoreStrategy } from '@igo2/common';

import { FeatureStore } from '../store';
import { FeatureStoreInMapResolutionStrategyOptions, Feature } from '../feature.interfaces';
import { Subscription } from 'rxjs';
import { skipWhile } from 'rxjs/operators';

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
    super.bindStore(store);
    if (this.active === true) {
      this.watchStore(store);
    }
    this.empty$$ = store.empty$
      .subscribe(() => this.updateEntitiesInResolution(store, store.layer.map.viewController.getResolution()));
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

    this.updateEntitiesInResolution(store, store.layer.map.viewController.getResolution());
    this.resolution$$.push(store.layer.map.viewController.resolution$.subscribe((res) => {
      this.updateEntitiesInResolution(store, res);
    }));
  }

  private updateEntitiesInResolution(store, mapResolution: number) {
    if (mapResolution > store.layer.minResolution && mapResolution < store.layer.maxResolution) {
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
    this.resolution$$.map(state => state.unsubscribe());
    if (this.empty$$) { this.empty$$.unsubscribe(); }
  }
}
