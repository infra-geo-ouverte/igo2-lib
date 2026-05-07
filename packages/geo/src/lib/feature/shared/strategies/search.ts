import { EntityStoreStrategy } from '@igo2/common/entity';

import FlexSearch, { DocumentOptions } from 'flexsearch';
import { skipWhile } from 'rxjs/operators';

import { SearchIndexOptions } from '../../../datasource';
import { FeatureStoreSearchIndexStrategyOptions } from '../feature.interfaces';
import { FeatureStore } from '../store';

/**
 *
 * This strategy loads a layer's features's properties into a searchable index.
 */
export class FeatureStoreSearchIndexStrategy extends EntityStoreStrategy {
  /**
   * Subscription to the store's OL source changes
   */
  private stores$$ = new Map<FeatureStore, string>();

  constructor(protected options: FeatureStoreSearchIndexStrategyOptions) {
    super(options);
  }

  /**
   * Bind this strategy to a store and start watching for entities changes
   * @param store Feature store
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bindStore(store: any) {
    super.bindStore(store);
    if (this.active === true) {
      this.watchStore(store);
    }
  }

  /**
   * Unbind this strategy from a store and stop watching for entities changes
   * @param store Feature store
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unbindStore(store: any) {
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
    (this.stores as FeatureStore[]).forEach((store: FeatureStore) =>
      this.watchStore(store)
    );
  }

  /**
   * Stop watching all stores bound to that strategy
   * @internal
   */
  protected doDeactivate() {
    this.unwatchAll();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private initStoreSearchIndex(store: any) {
    store.searchDocument = new FlexSearch.Document({ tokenize: 'full' });
  }

  /**
   * Watch for a store's entities changes
   * @param store Feature store
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private watchStore(store: any) {
    if (this.stores$$.has(store)) {
      return;
    }
    this.initStoreSearchIndex(store);

    store.entities$
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .pipe(skipWhile((e: any) => !e.length))
      .subscribe(() => this.onEntitiesChanges(store));
  }

  /**
   * Stop watching for a store's entities changes
   * @param store Feature store
   */
  private unwatchStore(store: FeatureStore) {
    const key = this.stores$$.get(store);
    if (key !== undefined) {
      store.searchDocument = undefined;
      this.stores$$.delete(store);
    }
  }

  /**
   * Stop watching for OL source changes in all stores.
   */
  private unwatchAll() {
    this.stores$$.clear();
  }

  /**
   * Maintain searcahble index for every loaded entities
   * @param store Feature store
   */
  private onEntitiesChanges(store: FeatureStore) {
    const ratio = this.options.percentDistinctValueRatio || 2;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const featuresProperties: any[] = [];
    store.index.forEach((value, key) => {
      const fp = value.properties;
      fp.igoSearchID = key;
      featuresProperties.push(fp);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toIndex: any[] = [];
    let columnsToNotIndex: any[] = [];
    let contentToIndex: SearchIndexOptions[] = [];
    if (this.options.sourceFields) {
      columnsToNotIndex = this.options.sourceFields.filter(
        (sf) => !sf.searchIndex?.enabled
      );
      contentToIndex = this.options.sourceFields
        .filter((sf) => sf.searchIndex?.enabled)
        .map((sf2) => {
          return Object.assign(
            {},
            { field: sf2.name, tokenize: 'full' },
            sf2.searchIndex
          );
        });
    } else {
      if (featuresProperties.length) {
        // THIS METHOD COMPUTE COLUMN DISTINCT VALUE TO FILTER WHICH COLUMN TO INDEX BASED ON A RATIO or discard float columns
        const columns = Object.keys(featuresProperties[0]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const columnsToIndex: any[] = [];
        columnsToNotIndex = columns
          .map((column) => {
            const distinctValues = [
              ...new Set(featuresProperties.map((item) => item[column]))
            ];
            // identify column to not index based on a ratio distinctValues/nb of features OR discart exclusive float column (ex: lat, long)
            if (
              (distinctValues.length / featuresProperties.length) * 100 <=
                ratio ||
              distinctValues.every((n) => Number(n) === n && n % 1 !== 0)
            ) {
              columnsToNotIndex.push(column);
            } else {
              columnsToIndex.push(column);
            }
          })
          .filter((f) => f);
        const keysToIndex = columnsToIndex.filter((f) => f !== 'igoSearchID');
        contentToIndex = keysToIndex.map((key) => {
          return { field: key, tokenize: 'full' };
        });
      }
    }
    store.index.forEach((value) => {
      const propertiesToIndex = JSON.parse(JSON.stringify(value.properties));
      columnsToNotIndex.map((c) => delete propertiesToIndex[c]);
      if (Object.keys(propertiesToIndex).length) {
        toIndex.push(propertiesToIndex);
      }
    });

    if (toIndex.length === 0) {
      this.initStoreSearchIndex(store);
    } else {
      store.searchDocument = new FlexSearch.Document({
        document: {
          id: 'igoSearchID',
          index: contentToIndex
        } as DocumentOptions
      });
      toIndex.map((i) => {
        store.searchDocument.add(i.igoSearchID, i);
      });
    }
  }
}
