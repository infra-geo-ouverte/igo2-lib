import * as olextent from 'ol/extent';

import { EntityStoreStrategy } from '@igo2/common';

import { FeatureStore } from '../store';
import { FeatureStoreInMapExtentStrategyOptions } from '../feature.interfaces';
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
    this.states$$.push(
      store.layer.map.viewController.state$.subscribe(() => {
        this.updateEntitiesInExtent(store);
      })
    );
  }

  private updateEntitiesInExtent(store) {
    if (store?.layer?.map?.viewController) {
      store.state.updateAll({ inMapExtent: false });
      const mapExtent = store.layer.map.viewController.getExtent();
      let entitiesInMapExtent = [];
      let entitiesWithNoGeom = [];
      for (const entity of store.entities$.value) {
        if (entity.ol) {
          if (
            olextent.intersects(entity.ol.getGeometry().getExtent(), mapExtent)
          ) {
            entitiesInMapExtent.push(entity);
          }
        } else {
          entitiesWithNoGeom.push(entity);
        }
      }
      if (entitiesInMapExtent.length > 0) {
        store.state.updateMany(
          entitiesInMapExtent,
          { inMapExtent: true },
          false
        );
      }
      if (entitiesWithNoGeom.length > 0) {
        store.state.updateMany(
          entitiesWithNoGeom,
          { inMapExtent: true },
          false
        );
      }
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
    this.states$$.map((state) => state.unsubscribe());
    if (this.empty$$) {
      this.empty$$.unsubscribe();
    }
  }
}
