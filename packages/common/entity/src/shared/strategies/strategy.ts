import { BehaviorSubject } from 'rxjs';

import { EntityStoreStrategyOptions } from '../entity.interfaces';
import type { EntityStore } from '../store';

/**
 * Entity store strategies. They can do pretty much anything during a store's
 * lifetime. For example, they may act as triggers when something happens.
 * Sharing a strategy is a good idea when multiple strategies would have
 * on cancelling effect on each other.
 *
 * At creation, strategy is inactive and needs to be manually activated.
 */
export class EntityStoreStrategy {
  /**
   * Feature store
   * @internal
   */
  protected stores: EntityStore[] = [];

  /**
   * Whether this strategy is active
   * @internal
   */
  get active(): boolean {
    return this.active$.value;
  }
  readonly active$ = new BehaviorSubject<boolean>(false);

  constructor(protected options: EntityStoreStrategyOptions = {}) {
    this.options = options;
  }

  /**
   * Activate the strategy. If it's already active, it'll be deactivated
   * and activated again.
   */
  activate() {
    if (this.active === true) {
      this.doDeactivate();
    }
    this.active$.next(true);
    this.doActivate();
  }

  /**
   * Activate the strategy. If it's already active, it'll be deactivated
   * and activated again.
   */
  deactivate() {
    this.active$.next(false);
    this.doDeactivate();
  }

  /**
   * Bind this strategy to a store
   * @param store Feature store
   */
  bindStore(store: EntityStore) {
    if (this.stores.indexOf(store) < 0) {
      this.stores.push(store);
    }
  }

  /**
   * Unbind this strategy from store
   * @param store Feature store
   */
  unbindStore(store: EntityStore) {
    const index = this.stores.indexOf(store);
    if (index >= 0) {
      this.stores.splice(index, 1);
    }
  }

  /**
   * Do the stataegy activation
   * @internal
   */
  protected doActivate() {
    // empty
  }

  /**
   * Do the strategy deactivation
   * @internal
   */
  protected doDeactivate() {
    // empty
  }
}
