import { FeatureStore } from './store';
import { FeatureStoreLoadingStrategy } from './strategies/loading';
import { FeatureStoreSelectionStrategy } from './strategies/selection';

/**
 * Try to add a loading strategy to a store and activate it.
 * If no strategy is given to that function, a basic one will be created.
 * @param store The store to bind the loading strategy
 * @param strategy An optional loading strategy
 */
export function tryAddLoadingStrategy(
  store: FeatureStore,
  strategy?: FeatureStoreLoadingStrategy
) {
  if (store.getStrategyOfType(FeatureStoreLoadingStrategy) !== undefined) {
    store.activateStrategyOfType(FeatureStoreLoadingStrategy);
    return;
  }

  strategy = strategy ? strategy : new FeatureStoreLoadingStrategy({});
  store.addStrategy(strategy);
  strategy.activate();
}

/**
 * Try to add a selection strategy to a store and activate it.
 * If no strategy is given to that function, a basic one will be created.
 * @param store The store to bind the selection strategy
 * @param [strategy] An optional selection strategy
 */
export function tryAddSelectionStrategy(
  store: FeatureStore,
  strategy?: FeatureStoreSelectionStrategy
) {
  if (store.getStrategyOfType(FeatureStoreSelectionStrategy) !== undefined) {
    store.activateStrategyOfType(FeatureStoreSelectionStrategy);
    return;
  }
  strategy = strategy
    ? strategy
    : new FeatureStoreSelectionStrategy({
        map: store.map
      });
  store.addStrategy(strategy);
  strategy.activate();
}
