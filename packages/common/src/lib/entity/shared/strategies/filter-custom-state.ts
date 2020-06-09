import { EntityRecord } from '../entity.interfaces';
import { EntityStore } from '../store';
import { EntityStoreStrategy } from './strategy';

/**
 * When active, this strategy filters a store's stateView to return
 * selected entities only.
 */
export class EntityStoreFilterCustomStateStrategy extends EntityStoreStrategy {

    /**
     * Store / filter ids map
     */
    private filters: Map<EntityStore, string> = new Map();

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
        const state = this.options.state;
        const value = this.options.value;
        if (this.filters.has(store) || !state || value === undefined) {
            return;
        }
        // TODO Manage values in array.
        const filter = (record: EntityRecord<object>) => {
            return record.state[state] === value;
        };
        this.filters.set(store, store.stateView.addFilter(filter));
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
