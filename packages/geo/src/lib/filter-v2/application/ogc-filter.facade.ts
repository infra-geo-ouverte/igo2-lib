import { Injectable, Injector, effect, inject } from '@angular/core';

import { OgcFilterConfig } from '../model';
import {
  encodeWfsOgcFilterParam,
  encodeWmsOgcFilterParam
} from '../serialization';
import { OgcFilterStore, createOgcFilterStore } from '../state';
import { OgcFilterTarget } from './ogc-filter-target.interface';

export interface OgcFilterConnection {
  readonly store: OgcFilterStore;
  readonly target: OgcFilterTarget;
  disconnect(): void;
}

/**
 * Application service orchestrating the filter domain: creates stores from
 * declarative configurations and keeps targets in sync with the store state.
 * This replaces the three concurrent legacy application paths (WMS
 * constructor, `setOgcWMSFiltersOptions` and the selection component).
 */
@Injectable({ providedIn: 'root' })
export class OgcFilterFacade {
  private readonly injector = inject(Injector);
  private readonly stores = new WeakMap<object, OgcFilterStore>();

  createStore(config: OgcFilterConfig): OgcFilterStore {
    return createOgcFilterStore(config);
  }

  /** Retrieves the store connected for an owner (ex: a datasource). */
  getStore(owner: object): OgcFilterStore | undefined {
    return this.stores.get(owner);
  }

  /**
   * Applies the store's effective filter to the target now and on every
   * subsequent state change, until `disconnect` is called. When an `owner`
   * is provided (ex: the datasource), the store becomes retrievable through
   * `getStore` for UI tools.
   */
  connect(
    store: OgcFilterStore,
    target: OgcFilterTarget,
    owner?: object
  ): OgcFilterConnection {
    if (owner) {
      this.stores.set(owner, store);
    }
    const watcher = effect(
      () => {
        const node = store.effectiveFilter();
        const encoded =
          target.protocol === 'wms'
            ? encodeWmsOgcFilterParam(
                node,
                target.layerNames,
                target.filterVersion
              )
            : encodeWfsOgcFilterParam(node, target.filterVersion);
        target.applyOgcFilter({ node, encoded });
      },
      { injector: this.injector }
    );
    return {
      store,
      target,
      disconnect: () => {
        watcher.destroy();
        if (owner && this.stores.get(owner) === store) {
          this.stores.delete(owner);
        }
      }
    };
  }
}
