import { EntityStoreStrategyFuncOptions } from '../entity.interfaces';
import { EntityStore } from '../store';
import { EntityStoreStrategy } from './strategy';

/**
 * When active, this strategy filters a store's stateView to return
 * selected entities only.
 */
export class EntityStoreFilterCustomFuncStrategy extends EntityStoreStrategy {
  constructor(protected options: EntityStoreStrategyFuncOptions) {
    super(options);
  }

  /**
   * Store / filter ids map
   */
  private filters = new Map<EntityStore, string>();

  /**
   * Bind this strategy to a store and start filtering it
   * @param store Entity store
   */
  bindStore(store: EntityStore) {
    super.bindStore(store);
    if (this.active === true) {
      this.filterStore(store);
    }
  }

  /**
   * Unbind this strategy from a store and stop filtering it
   * @param store Entity store
   */
  unbindStore(store: EntityStore) {
    super.unbindStore(store);
    if (this.active === true) {
      this.unfilterStore(store);
    }
  }

  /**
   * Start filtering all stores
   * @internal
   */
  protected doActivate() {
    this.filterAll();
  }

  /**
   * Stop filtering all stores
   * @internal
   */
  protected doDeactivate() {
    this.unfilterAll();
  }

  /**
   * Filter all stores
   */
  private filterAll() {
    this.stores.forEach((store: EntityStore) => this.filterStore(store));
  }

  /**
   * Unfilter all stores
   */
  private unfilterAll() {
    this.stores.forEach((store: EntityStore) => this.unfilterStore(store));
  }

  /**
   * Filter a store and add it to the filters map
   */
  private filterStore(store: EntityStore) {
    this.filters.set(
      store,
      store.stateView.addFilter(this.options.filterClauseFunc)
    );
  }

  /**
   * Unfilter a store and delete it from the filters map
   */
  private unfilterStore(store: EntityStore) {
    const filterId = this.filters.get(store);
    if (filterId === undefined) {
      return;
    }

    store.stateView.removeFilter(filterId);
    this.filters.delete(store);
  }
}
