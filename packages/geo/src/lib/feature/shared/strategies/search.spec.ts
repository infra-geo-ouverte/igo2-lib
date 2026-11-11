import '@angular/compiler';

import { EntityKey } from '@igo2/common/entity';

import { BehaviorSubject } from 'rxjs';

import { FeatureStoreSearchIndexStrategy } from './search';

type TestFeature = {
  properties: Record<string, unknown>;
};

type TestSearchDocument = {
  search: (term: string) => unknown;
};

type TestStore = {
  entities$: BehaviorSubject<TestFeature[]>;
  index: Map<EntityKey, TestFeature>;
  searchDocument: TestSearchDocument | undefined;
};

const aeroportPisteAlma = createFeature({
  codeindic: 'CYTF',
  nomnavcana: 'Alma',
  remarque: '',
  nbrpiste: 1,
  longpiste2: '5000',
  indicpiste: '13, 31',
  surface: 'Asphalte',
  province: 'QC',
  source:
    'NAV CANADA supplément de vol - Canada (CFS), numérisation à partir de photos aériennes géoréférencées.',
  datdebappt: 20040930,
  version: 20251007,
  objectid: 1
});

const aeroportPisteDorval = createFeature({
  codeindic: 'CYUL',
  nomnavcana: 'Montréal/Pierre-Elliott-Trudeau Intl (Dorval)',
  remarque: '',
  nbrpiste: 3,
  longpiste2: '11000/9892',
  indicpiste: '06L, 24R / 06R, 24L',
  surface: 'CONC/CONC',
  province: 'QC',
  source:
    'NAV CANADA supplément de vol - Canada (CFS), numérisation à partir de photos aériennes géoréférencées.',
  datdebappt: 20040930,
  version: 20251007,
  objectid: 47
});

function createFeature(properties: Record<string, unknown>): TestFeature {
  return { properties };
}

function createStore(entries: [EntityKey, TestFeature][]): TestStore {
  return {
    entities$: new BehaviorSubject<TestFeature[]>([]),
    index: new Map(entries),
    searchDocument: undefined
  };
}

describe('FeatureStoreSearchIndexStrategy', () => {
  it('should rebuild the search index for aeroport_piste properties without throwing', () => {
    const store = createStore([['feature-1', aeroportPisteAlma]]);
    const strategy = new FeatureStoreSearchIndexStrategy({
      sourceFields: [
        {
          name: 'objectid',
          searchIndex: { enabled: true, tokenize: 'strict' }
        },
        { name: 'codeindic', searchIndex: { enabled: true } },
        { name: 'nomnavcana', searchIndex: { enabled: true } },
        { name: 'nbrpiste', searchIndex: { enabled: true } },
        { name: 'datdebappt', searchIndex: { enabled: true } },
        { name: 'version', searchIndex: { enabled: true } },
        { name: 'source', searchIndex: { enabled: true } },
        { name: 'remarque', searchIndex: { enabled: true } }
      ]
    });

    strategy.activate();
    strategy.bindStore(store as never);

    expect(() => store.entities$.next([aeroportPisteAlma])).not.toThrow();
    expect(store.searchDocument).toBeTruthy();
  });

  it('should preserve numeric entity ids in search results', () => {
    const store = createStore([[47, aeroportPisteDorval]]);
    const strategy = new FeatureStoreSearchIndexStrategy({
      sourceFields: [
        {
          name: 'objectid',
          searchIndex: { enabled: true, tokenize: 'strict' }
        },
        { name: 'codeindic', searchIndex: { enabled: true } },
        { name: 'nomnavcana', searchIndex: { enabled: true } },
        { name: 'source', searchIndex: { enabled: true } },
        { name: 'remarque', searchIndex: { enabled: true } }
      ]
    });

    strategy.activate();
    strategy.bindStore(store as never);
    store.entities$.next([aeroportPisteDorval]);

    const results = store.searchDocument!.search('47');

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'objectid',
          result: expect.arrayContaining([47])
        })
      ])
    );
  });
});
