import '@angular/compiler';

import { BehaviorSubject } from 'rxjs';

import { FeatureStoreSearchIndexStrategy } from './search';

type TestFeature = {
  properties: Record<string, unknown>;
};

type TestStore = {
  entities$: BehaviorSubject<TestFeature[]>;
  index: Map<string, TestFeature>;
  searchDocument: any;
};

function createFeature(properties: Record<string, unknown>): TestFeature {
  return { properties };
}

function createStore(entries: [string, TestFeature][]): TestStore {
  return {
    entities$: new BehaviorSubject<TestFeature[]>([]),
    index: new Map(entries),
    searchDocument: undefined
  };
}

describe('FeatureStoreSearchIndexStrategy', () => {
  it('should rebuild the search index for mixed-type properties without throwing', () => {
    const feature = createFeature({
      name: 'Route blanche',
      routeNumber: 55555,
      active: true,
      aliases: ['Middle Bay', 'Havre-Saint-Pierre'],
      metadata: { source: 'GPS' }
    });
    const store = createStore([['feature-1', feature]]);
    const strategy = new FeatureStoreSearchIndexStrategy({
      sourceFields: [
        { name: 'name', searchIndex: { enabled: true } },
        { name: 'routeNumber', searchIndex: { enabled: true } },
        { name: 'active', searchIndex: { enabled: true } },
        { name: 'aliases', searchIndex: { enabled: true } },
        { name: 'metadata', searchIndex: { enabled: true } }
      ]
    });

    strategy.activate();
    strategy.bindStore(store as never);

    expect(() => store.entities$.next([feature])).not.toThrow();
    expect(store.searchDocument).toBeTruthy();
  });

  it('should return matching ids when searching serialized numeric fields', () => {
    const feature = createFeature({
      roadName: 'Route blanche',
      routeCode: 73380,
      direction: 'Nord'
    });
    const store = createStore([['feature-1', feature]]);
    const strategy = new FeatureStoreSearchIndexStrategy({
      sourceFields: [
        { name: 'roadName', searchIndex: { enabled: true } },
        { name: 'routeCode', searchIndex: { enabled: true } },
        { name: 'direction', searchIndex: { enabled: true } }
      ]
    });

    strategy.activate();
    strategy.bindStore(store as never);
    store.entities$.next([feature]);

    const results = store.searchDocument.search('73380');

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'routeCode',
          result: expect.arrayContaining(['feature-1'])
        })
      ])
    );
  });
});
