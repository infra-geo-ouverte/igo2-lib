import { ReplaySubject } from 'rxjs';

import { EntityKey, EntityState, EntityStateManagerOptions } from './entity.interfaces';
import { getEntityId } from './entity.utils';
import { EntityStore } from './store';

/**
 * This class is used to track a store's entities state
 */
export class EntityStateManager<E extends object, S extends EntityState = EntityState> {

  /**
   * State index
   */
  readonly index = new Map<EntityKey, S>();

  /**
   * Change emitter
   */
  readonly change$ = new ReplaySubject<void>(1);

  /**
   * Method to get an entity's id
   */
  readonly getKey: (E) => EntityKey;

  private store: EntityStore<object> | undefined;

  constructor(options: EntityStateManagerOptions = {}) {
    this.store = options.store ? options.store : undefined;
    this.getKey = options.getKey
      ? options.getKey
      : (this.store ? this.store.getKey : getEntityId);
    this.next();
  }

  /**
   * Clear state
   */
  clear() {
    if (this.index.size > 0) {
      this.index.clear();
      this.next();
    }
  }

  /**
   * Get an entity's state
   * @param entity Entity
   * @returns State
   */
  get(entity: E): S {
    return (this.index.get(this.getKey(entity)) || {}) as S;
  }

  /**
   * Set an entity's state
   * @param entity Entity
   * @param state State
   */
  set(entity: E, state: S) {
    this.setMany([entity], state);
  }

  /**
   * Set many entitie's state
   * @param entitie Entities
   * @param state State
   */
  setMany(entities: E[], state: S) {
    entities.forEach((entity: E) => {
      this.index.set(this.getKey(entity), Object.assign({}, state));
    });
    this.next();
  }

  /**
   * Set state of all entities that already have a state. This is not
   * the same as setting the state of all the store's entities.
   * @param state State
   */
  setAll(state: S) {
    Array.from(this.index.keys()).forEach((key: EntityKey) => {
      this.index.set(key, Object.assign({}, state));
    });
    this.next();
  }

  /**
   * Update an entity's state
   * @param entity Entity
   * @param changes State changes
   */
  update(entity: E, changes: Partial<S>, exclusive = false) {
    this.updateMany([entity], changes, exclusive);
  }

  /**
   * Update many entitie's state
   * @param entitie Entities
   * @param changes State changes
   */
  updateMany(entities: E[], changes: Partial<S>, exclusive = false) {
    if (exclusive === true) {
      return this.updateManyExclusive(entities, changes);
    }

    entities.forEach((entity: E) => {
      const state = Object.assign({}, this.get(entity), changes);
      this.index.set(this.getKey(entity), state);
    });
    this.next();
  }

  /**
   * Reversee an entity's state
   * @param entity Entity
   * @param keys State keys to reverse
   */
  reverse(entity: E, keys: string[]) {
    this.reverseMany([entity], keys);
  }

  /**
   * Reverse many entitie's state
   * @param entitie Entities
   * @param keys State keys to reverse
   */
  reverseMany(entities: E[], keys: string[]) {
    entities.forEach((entity: E) => {
      const currentState = this.get(entity);
      const changes = keys.reduce((acc: {[key: string]: boolean}, key: string) => {
        acc[key] = currentState[key] || false;
        return acc;
      }, {}) as Partial<S>;
      const reversedChanges = this.reverseChanges(changes);
      const state = Object.assign({}, currentState, reversedChanges);
      this.index.set(this.getKey(entity), state);
    });
    this.next();
  }

  /**
   * Update state of all entities that already have a state. This is not
   * the same as updating the state of all the store's entities.
   * @param changes State
   */
  updateAll(changes: Partial<S>) {
    const allKeys = this.getAllKeys();
    Array.from(allKeys).forEach((key: EntityKey) => {
      const state = Object.assign({}, this.index.get(key), changes);
      this.index.set(key, state);
    });
    this.next();
  }

  /**
   * When some state changes are flagged as 'exclusive', reverse
   * the state of all other entities. Changes are reversable when
   * they are boolean.
   * @param entitie Entities
   * @param changes State changes
   */
  private updateManyExclusive(entities: E[], changes: Partial<S>) {
    const reverseChanges = this.reverseChanges(changes);

    const keys = entities.map((entity: E) => this.getKey(entity));
    const allKeys = new Set(keys.concat(Array.from(this.getAllKeys())));
    allKeys.forEach((key: EntityKey) => {
      const state = this.index.get(key) || {} as S;

      if (keys.indexOf(key) >= 0) {
        this.index.set(key, Object.assign({}, state, changes));
      } else {
        // Update only if the reverse changes would modify
        // a key already present in the current state
        const shouldUpdate = Object.keys(reverseChanges).some((changeKey: string) => {
          return state[changeKey] !== undefined &&
            state[changeKey] !== reverseChanges[changeKey];
        });
        if (shouldUpdate === true) {
          this.index.set(key, Object.assign({}, state, reverseChanges));
        }
      }
    });

    this.next();
  }

  /**
   * Compute a 'reversed' version of some state changes.
   * Changes are reversable when they are boolean.
   * @param changes State changes
   * @returns Reversed state changes
   */
  private reverseChanges(changes: Partial<S>): Partial<S> {
    return Object.entries(changes).reduce((reverseChanges: Partial<S>, bunch: [string, any]) => {
      const [changeKey, value] = bunch;
      if (typeof value === typeof true) {
        (reverseChanges as object)[changeKey] = !value;
      }
      return reverseChanges;
    }, {});
  }

  /**
   * Return all the keys in that state and in the store it's bound to, if any.
   * @returns Set of keys
   */
  private getAllKeys(): Set<EntityKey> {
    const storeKeys = this.store ? Array.from(this.store.index.keys()) : [];
    return new Set(Array.from(this.index.keys()).concat(storeKeys));
  }

  /**
   * Emit 'change' event
   */
  private next() {
    this.change$.next();
  }


  getFeaturesSelected() {
    let featuresSelected = [];
    for (const [key, value] of this.index) {
      if(value.selected) {
        featuresSelected.push(this.store.get(key));
      }
  }
  return featuresSelected;
  }
}
