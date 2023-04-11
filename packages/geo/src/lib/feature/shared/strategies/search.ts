import { Document, DocumentOptions } from 'flexsearch';
import { EntityStoreStrategy } from '@igo2/common';
import { FeatureStore } from '../store';
import { FeatureStoreSearchIndexStrategyOptions } from '../feature.interfaces';
import { skipWhile } from 'rxjs/operators';

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
  bindStore(store: FeatureStore) {
    super.bindStore(store);
    if (this.active === true) {
      this.watchStore(store);
    }
  }

  /**
   * Unbind this strategy from a store and stop watching for entities changes
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

  private initStoreSearchIndex(store) {
    store.searchDocument = new Document({ tokenize: "full" });
  }

  /**
   * Watch for a store's entities changes
   * @param store Feature store
   */
  private watchStore(store: FeatureStore) {
    if (this.stores$$.has(store)) {
      return;
    }
    this.initStoreSearchIndex(store);

    store.entities$
      .pipe(skipWhile((e) => !e.length))
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
    Array.from(this.stores$$.entries()).forEach((entries: [FeatureStore, string]) => {
    });
    this.stores$$.clear();
  }

  /**
   * Maintain searcahble index for every loaded entities
   * @param store Feature store
   */
  private onEntitiesChanges(store: FeatureStore) {
    const ratio = this.options.percentDistinctValueRatio || 2;
    const featuresProperties = [];
    store.index.forEach((value, key) => {
      const fp = value.properties;
      fp.igoSearchID = key;
      featuresProperties.push(fp);
    });
    const toIndex = [];
    let columnsToNotIndex = [];
    let contentToIndex = [];
    if (this.options.sourceFields) {
      columnsToNotIndex = this.options.sourceFields.filter(sf => !sf.searchIndex?.enabled);
      contentToIndex = this.options.sourceFields.filter(sf => sf.searchIndex?.enabled).map(sf2 => {
        return Object.assign({}, {field: sf2.name, tokenize: "full"}, sf2.searchIndex);
      });
    } else {
      if (featuresProperties.length) {
        // THIS METHOD COMPUTE COLUMN DISTINCT VALUE TO FILTER WHICH COLUMN TO INDEX BASED ON A RATIO or discard float columns
        const columns = Object.keys(featuresProperties[0]);
        const columnsToIndex = [];
        columnsToNotIndex = columns.map((column) => {
          const distinctValues = [...new Set(featuresProperties.map(item => item[column]))];
          // identify column to not index based on a ratio distinctValues/nb of features OR discart exclusive float column (ex: lat, long)
          if (
            (distinctValues.length / featuresProperties.length) * 100 <= ratio ||
            distinctValues.every(n => Number(n) === n && n % 1 !== 0)) {
            columnsToNotIndex.push(column);
          } else {
            columnsToIndex.push(column);
          }
        }).filter(f => f);
        const keysToIndex = columnsToIndex.filter(f => f !== 'igoSearchID');
        contentToIndex = keysToIndex.map(key => { return { field: key, tokenize: "full" }; });
      }
    }
    store.index.forEach((value, key) => {
      const propertiesToIndex = JSON.parse(JSON.stringify(value.properties));
      columnsToNotIndex.map(c => delete propertiesToIndex[c]);
      if (Object.keys(propertiesToIndex).length) {
        toIndex.push(propertiesToIndex);
      }
    });

    if (toIndex.length === 0) {
      this.initStoreSearchIndex(store);
    } else {


      store.searchDocument = new Document({
        document: {
          id: 'igoSearchID',
          index: contentToIndex
        } as DocumentOptions<any>
      });
      toIndex.map(i => {
        store.searchDocument.add(i.igoSearchID, i);
      });
    }
  }
}
