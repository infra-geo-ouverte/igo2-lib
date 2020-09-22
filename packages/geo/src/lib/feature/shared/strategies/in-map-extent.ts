import { unByKey } from 'ol/Observable';
import * as olextent from 'ol/extent';

import { EntityStoreStrategy } from '@igo2/common';

import { FeatureStore } from '../store';
import { FeatureStoreInMapExtentStrategyOptions, Feature } from '../feature.interfaces';
import { Subscription } from 'rxjs';
import { skipWhile } from 'rxjs/operators';

/**
 * This strategy maintain the store features updated while the map is moved.
 * The features's state inside the map are tagged inMapExtent = true;
 */
export class FeatureStoreInMapExtentStrategy extends EntityStoreStrategy {

  /**
   * Subscription to the store's OL source changes
   */
  private stores$$ = new Map<FeatureStore, string>();
  private states$$: Subscription[] = [];
  private empty$$: Subscription;

  constructor(protected options: FeatureStoreInMapExtentStrategyOptions) {
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
      .pipe(skipWhile((empty) => !empty))
      .subscribe(() => this.updateEntitiesInExtent(store));
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

    this.updateEntitiesInExtent(store);
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
    if (this.empty$$) { this.empty$$.unsubscribe(); }
  }
}
