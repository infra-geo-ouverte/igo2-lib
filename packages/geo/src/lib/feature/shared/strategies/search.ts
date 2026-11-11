import {
  EntityKey,
  EntityStore,
  EntityStoreStrategy
} from '@igo2/common/entity';

import FlexSearch, { DocumentData, DocumentOptions } from 'flexsearch';
import { Subscription } from 'rxjs';
import { skipWhile } from 'rxjs/operators';

import { SearchIndexOptions } from '../../../datasource';
import { FeatureStoreSearchIndexStrategyOptions } from '../feature.interfaces';
import { FeatureStore } from '../store';

type SearchDocumentFieldOptions = SearchIndexOptions & { field: string };
type SearchableDocument = DocumentData & { igoSearchID: EntityKey };
type IndexedFeatureProperties = {
  igoSearchID: EntityKey;
  properties: Record<string, unknown>;
};

/**
 *
 * This strategy loads a layer's features's properties into a searchable index.
 */
export class FeatureStoreSearchIndexStrategy extends EntityStoreStrategy {
  /**
   * Subscription to the store's OL source changes
   */
  private stores$$ = new Map<FeatureStore, Subscription>();

  constructor(protected options: FeatureStoreSearchIndexStrategyOptions) {
    super(options);
  }

  /**
   * Bind this strategy to a store and start watching for entities changes
   * @param store Feature store
   */
  bindStore(store: EntityStore) {
    super.bindStore(store);
    const featureStore = store as FeatureStore;
    if (this.active === true) {
      this.watchStore(featureStore);
    }
  }

  /**
   * Unbind this strategy from a store and stop watching for entities changes
   * @param store Feature store
   */
  unbindStore(store: EntityStore) {
    super.unbindStore(store);
    const featureStore = store as FeatureStore;
    if (this.active === true) {
      this.unwatchStore(featureStore);
    }
  }

  /**
   * Start watching all stores already bound to that strategy at once.
   * @internal
   */
  protected doActivate() {
    this.stores.forEach((store) => this.watchStore(store as FeatureStore));
  }

  /**
   * Stop watching all stores bound to that strategy
   * @internal
   */
  protected doDeactivate() {
    this.unwatchAll();
  }

  private initStoreSearchIndex(store: FeatureStore) {
    store.searchDocument = this.createEmptySearchDocument();
  }

  private createEmptySearchDocument() {
    return new FlexSearch.Document({ tokenize: 'full' });
  }

  private createSearchDocument(indexFields: SearchDocumentFieldOptions[]) {
    return new FlexSearch.Document({
      document: {
        id: 'igoSearchID',
        index: indexFields
      } as DocumentOptions
    });
  }

  private toSearchableValue(value: unknown): string | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return String(value);
    }

    if (Array.isArray(value)) {
      const values = value
        .map((item) => this.toSearchableValue(item))
        .filter((item): item is string => item !== undefined && item !== '');

      return values.length ? values.join(' ') : undefined;
    }

    return undefined;
  }

  private toFieldName(value: unknown): string | undefined {
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }

  private buildSearchDocument(
    properties: Record<string, unknown>,
    fieldNames: string[],
    igoSearchID: EntityKey
  ): SearchableDocument {
    const searchDocument: SearchableDocument = { igoSearchID };

    fieldNames.forEach((fieldName) => {
      const value = this.toSearchableValue(properties[fieldName]);

      if (value !== undefined) {
        searchDocument[fieldName] = value;
      }
    });

    return searchDocument;
  }

  private collectIndexedFeatures(
    store: FeatureStore
  ): IndexedFeatureProperties[] {
    const indexedFeatures: IndexedFeatureProperties[] = [];

    store.index.forEach((value, key) => {
      indexedFeatures.push({
        igoSearchID: key,
        properties: value.properties as Record<string, unknown>
      });
    });

    return indexedFeatures;
  }

  private resolveIndexFields(
    indexedFeatures: IndexedFeatureProperties[]
  ): SearchDocumentFieldOptions[] {
    return this.options.sourceFields?.length
      ? this.resolveConfiguredIndexFields()
      : this.resolveInferredIndexFields(indexedFeatures);
  }

  private resolveConfiguredIndexFields(): SearchDocumentFieldOptions[] {
    const indexFields: SearchDocumentFieldOptions[] = [];

    this.options.sourceFields
      ?.filter((sourceField) => sourceField.searchIndex?.enabled)
      .forEach((sourceField) => {
        const fieldName = this.toFieldName(sourceField.name);

        if (fieldName === undefined) {
          return;
        }

        indexFields.push({
          ...sourceField.searchIndex,
          field: fieldName,
          tokenize: sourceField.searchIndex?.tokenize ?? 'full'
        });
      });

    return indexFields;
  }

  private resolveInferredIndexFields(
    indexedFeatures: IndexedFeatureProperties[]
  ): SearchDocumentFieldOptions[] {
    const sampleProperties = indexedFeatures[0]?.properties;

    if (sampleProperties === undefined) {
      return [];
    }

    return Object.keys(sampleProperties)
      .filter((fieldName) => fieldName !== 'igoSearchID')
      .filter((fieldName) => this.shouldIndexField(fieldName, indexedFeatures))
      .map((field) => ({ field, tokenize: 'full' }));
  }

  private shouldIndexField(
    fieldName: string,
    indexedFeatures: IndexedFeatureProperties[]
  ): boolean {
    const values = indexedFeatures.map(
      (feature) => feature.properties[fieldName]
    );
    const searchableValues = values
      .map((value) => this.toSearchableValue(value))
      .filter((value): value is string => value !== undefined);

    if (searchableValues.length === 0) {
      return false;
    }

    const distinctValueRatio =
      (new Set(searchableValues).size / indexedFeatures.length) * 100;

    return !(
      distinctValueRatio <= this.getDistinctValueRatio() ||
      this.hasExclusiveFloatValues(values)
    );
  }

  private getDistinctValueRatio(): number {
    return this.options.percentDistinctValueRatio || 2;
  }

  private hasExclusiveFloatValues(values: unknown[]): boolean {
    return values.every(
      (value) => typeof value === 'number' && !Number.isInteger(value)
    );
  }

  private buildSearchDocuments(
    indexedFeatures: IndexedFeatureProperties[],
    indexFields: SearchDocumentFieldOptions[]
  ): SearchableDocument[] {
    const fieldNamesToIndex = indexFields.map((item) => item.field);

    return indexedFeatures
      .map((feature) =>
        this.buildSearchDocument(
          feature.properties,
          fieldNamesToIndex,
          feature.igoSearchID
        )
      )
      .filter((document) => Object.keys(document).length > 1);
  }

  private rebuildSearchDocument(
    store: FeatureStore,
    indexFields: SearchDocumentFieldOptions[],
    documents: SearchableDocument[]
  ) {
    if (indexFields.length === 0 || documents.length === 0) {
      this.initStoreSearchIndex(store);
      return;
    }

    const searchDocument = this.createSearchDocument(indexFields);
    documents.forEach((document) => searchDocument.add(document));
    store.searchDocument = searchDocument;
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

    const subscription = store.entities$
      .pipe(skipWhile((entities) => entities.length === 0))
      .subscribe(() => this.onEntitiesChanges(store));
    this.stores$$.set(store, subscription);
  }

  /**
   * Stop watching for a store's entities changes
   * @param store Feature store
   */
  private unwatchStore(store: FeatureStore) {
    const subscription = this.stores$$.get(store);
    if (subscription !== undefined) {
      subscription.unsubscribe();
      store.searchDocument = undefined;
      this.stores$$.delete(store);
    }
  }

  /**
   * Stop watching for OL source changes in all stores.
   */
  private unwatchAll() {
    Array.from(this.stores$$.values()).forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.stores$$.clear();
  }

  /**
   * Maintain searcahble index for every loaded entities
   * @param store Feature store
   */
  private onEntitiesChanges(store: FeatureStore) {
    const indexedFeatures = this.collectIndexedFeatures(store);
    const indexFields = this.resolveIndexFields(indexedFeatures);
    const documents = this.buildSearchDocuments(indexedFeatures, indexFields);

    this.rebuildSearchDocument(store, indexFields, documents);
  }
}
