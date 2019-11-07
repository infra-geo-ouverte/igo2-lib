import { BehaviorSubject } from 'rxjs';

import { EntityStateManager } from './state';
import { EntityView } from './view';
import { EntityKey, EntityState, EntityRecord, EntityStoreOptions } from './entity.interfaces';
import { getEntityId, getEntityProperty } from './entity.utils';
import { EntityStoreStrategy } from './strategies/strategy';

/**
 * An entity store class holds any number of entities
 * as well as their state. It can be observed, filtered and sorted and
 * provides methods to insert, update or delete entities.
 */
export class EntityStore<E extends object = object, S extends EntityState = EntityState> {

  /**
   * Observable of the raw entities
   */
  readonly entities$ = new BehaviorSubject<E[]>([]);

  /**
   * Number of entities
   */
  readonly count$ = new BehaviorSubject<number>(0);
  get count(): number { return this.count$.value; }

  /**
   * Whether the store is empty
   */
  readonly empty$ = new BehaviorSubject<boolean>(true);
  get empty(): boolean { return this.empty$.value; }

  /**
   * Entity store state
   */
  readonly state: EntityStateManager<E, S>;

  /**
   * View of all the entities
   */
  readonly view: EntityView<E>;

  /**
   * View of all the entities and their state
   */
  readonly stateView: EntityView<E, EntityRecord<E, S>>;

  /**
   * Method to get an entity's id
   */
  readonly getKey: (E) => EntityKey;

  /**
   * Method to get an entity's named property
   */
  readonly getProperty: (E, prop: string) => any;

  /**
   * Store index
   */
  get index(): Map<EntityKey, E> { return this._index; }
  private _index: Map<EntityKey, E>;

  /**
   * Store index
   */
  get pristine(): boolean { return this._pristine; }
  private _pristine: boolean = true;

  /**
   * Strategies
   */
  private strategies: EntityStoreStrategy[] = [];

  constructor(entities: E[], options: EntityStoreOptions = {}) {
    this.getKey = options.getKey ? options.getKey : getEntityId;
    this.getProperty = options.getProperty ? options.getProperty : getEntityProperty;

    this.state = this.createStateManager();
    this.view = this.createDataView();
    this.stateView = this.createStateView();

    this.view.lift();
    this.stateView.lift();

    if (entities.length > 0) {
      this.load(entities);
    } else {
      this._index = this.generateIndex(entities);
    }
  }

  /**
   * Get an entity from the store by key
   * @param key Key
   * @returns Entity
   */
  get(key: EntityKey): E {
    return this.index.get(key);
  }

  /**
   * Get all entities in the store
   * @returns Array of entities
   */
  all(): E[] {
    return this.entities$.value;
  }

  /**
   * Set this store's entities
   * @param entities Entities
   */
  load(entities: E[], pristine: boolean = true) {
    this._index = this.generateIndex(entities);
    this._pristine = pristine;
    this.next();
  }

  /**
   * Clear the store's entities but keep the state and views intact.
   * Views won't return any data but future data will be subject to the
   * current views filter and sort
   */
  softClear() {
    if (this.index && this.index.size > 0) {
      this.index.clear();
      this._pristine = true;
      this.next();
    } else if (this.index) {
      this.updateCount();
    }
  }

  /**
   * Clear the store's entities, state and views
   */
  clear() {
    this.stateView.clear();
    this.view.clear();
    this.state.clear();
    this.softClear();
  }

  destroy() {
    this.stateView.destroy();
    this.view.destroy();
    this.clear();
  }

  /**
   * Insert an entity into the store
   * @param entity Entity
   */
  insert(entity: E) {
    this.insertMany([entity]);
  }

  /**
   * Insert many entities into the store
   * @param entities Entities
   */
  insertMany(entities: E[]) {
    entities.forEach((entity: E) => this.index.set(this.getKey(entity), entity));
    this._pristine = false;
    this.next();
  }

  /**
   * Update or insert an entity into the store
   * @param entity Entity
   */
  update(entity: E) {
    this.updateMany([entity]);
  }

  /**
   * Update or insert many entities into the store
   * @param entities Entities
   */
  updateMany(entities: E[]) {
    entities.forEach((entity: E) => this.index.set(this.getKey(entity), entity));
    this._pristine = false;
    this.next();
  }

  /**
   * Delete an entity from the store
   * @param entity Entity
   */
  delete(entity: E) {
    this.deleteMany([entity]);
  }

  /**
   * Delete many entities from the store
   * @param entities Entities
   */
  deleteMany(entities: E[]) {
    entities.forEach((entity: E) => this.index.delete(this.getKey(entity)));
    this._pristine = false;
    this.next();
  }

  /**
   * Add a strategy to this store
   * @param strategy Entity store strategy
   * @returns Entity store
   */
  addStrategy(strategy: EntityStoreStrategy, activate: boolean = false): EntityStore {
    const existingStrategy = this.strategies.find((_strategy: EntityStoreStrategy) => {
      return strategy.constructor === _strategy.constructor;
    });
    if (existingStrategy !== undefined) {
      throw new Error('A strategy of this type already exists on that EntityStore.');
    }

    this.strategies.push(strategy);
    strategy.bindStore(this);

    if (activate === true) {
      strategy.activate();
    }

    return this;
  }

  /**
   * Remove a strategy from this store
   * @param strategy Entity store strategy
   * @returns Entity store
   */
  removeStrategy(strategy: EntityStoreStrategy): EntityStore {
    const index = this.strategies.indexOf(strategy);
    if (index >= 0) {
      this.strategies.splice(index, 1);
      strategy.unbindStore(this);
    }
    return this;
  }

  /**
   * Return strategies of a given type
   * @param type Entity store strategy class
   * @returns Strategies
   */
  getStrategyOfType(type: typeof EntityStoreStrategy): EntityStoreStrategy {
    return this.strategies.find((strategy: EntityStoreStrategy) => {
      return strategy instanceof type;
    });
  }

  /**
   * Activate strategies of a given type
   * @param type Entity store strategy class
   */
  activateStrategyOfType(type: typeof EntityStoreStrategy) {
    const strategy = this.getStrategyOfType(type);
    if (strategy !== undefined) {
      strategy.activate();
    }
  }

  /**
   * Deactivate strategies of a given type
   * @param type Entity store strategy class
   */
  deactivateStrategyOfType(type: typeof EntityStoreStrategy) {
    const strategy = this.getStrategyOfType(type);
    if (strategy !== undefined) {
      strategy.deactivate();
    }
  }

  /**
   * Generate a complete index of all the entities
   * @param entities Entities
   * @returns Index
   */
  private generateIndex(entities: E[]): Map<EntityKey, E> {
    const entries = entities.map((entity: E) => [this.getKey(entity), entity]);
    return new Map(entries as [EntityKey, E][]);
  }

  /**
   * Push the index's entities into the entities$ observable
   */
  private next() {
    this.entities$.next(Array.from(this.index.values()));
    this.updateCount();
  }

  /**
   * Update the store's count and empty
   */
  private updateCount() {
    const count = this.index.size;
    const empty = count === 0;
    this.count$.next(count);
    this.empty$.next(empty);
  }

  /**
   * Create the entity state manager
   * @returns EntityStateManager
   */
  private createStateManager() {
    return new EntityStateManager<E, S>({store: this});
  }

  /**
   * Create the data view
   * @returns EntityView<E>
   */
  private createDataView() {
    return new EntityView<E>(this.entities$);
  }

  /**
   * Create the state view
   * @returns EntityView<EntityRecord<E>>
   */
  private createStateView() {
    return new EntityView<E, EntityRecord<E, S>>(this.view.all$())
      .join({
        source: this.state.change$,
        reduce: (entity: E): EntityRecord<E, S> => {
          const key = this.getKey(entity);
          const state = this.state.get(entity);
          const currentRecord = this.stateView.get(key);

          if (
            currentRecord !== undefined &&
            currentRecord.entity === entity &&
            this.statesAreTheSame(currentRecord.state, state)
          ) {
            return currentRecord;
          }

          const revision = currentRecord ? currentRecord.revision + 1 : 1;
          const ref = `${key}-${revision}`;
          return {entity, state, revision, ref};
        }
      })
      .createIndex((record: EntityRecord<E, S>) => this.getKey(record.entity));
  }

  private statesAreTheSame(currentState: S, newState: S): boolean {
    if (currentState === newState) {
      return true;
    }

    const currentStateIsEmpty = Object.keys(currentState).length === 0;
    const newStateIsEmpty = Object.keys(newState).length === 0;
    return currentStateIsEmpty && newStateIsEmpty;
  }

}
