import { EntityState } from './entity.interfaces';
import { EntityStoreStrategy } from './strategies/strategy';
import { EntityStore, EntityStoreOptions } from './store';

export class EntityStoreWithStrategy<
  E extends object = object,
  S extends EntityState = EntityState
> extends EntityStore<E, S> {
  /**
   * Strategies
   */
  private strategies: EntityStoreStrategy[] = [];

  constructor(entities: E[], options: EntityStoreOptions = {}) {
    super(entities, options);
  }

  /**
   * Add a strategy to this store
   * @param strategy Entity store strategy
   * @returns Entity store
   */
  addStrategy(
    strategy: EntityStoreStrategy,
    activate: boolean = false
  ): EntityStore {
    const existingStrategy = this.strategies.find(
      (_strategy: EntityStoreStrategy) => {
        return strategy.constructor === _strategy.constructor;
      }
    );
    if (existingStrategy !== undefined) {
      throw new Error(
        'A strategy of this type already exists on that EntityStore.'
      );
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
}
