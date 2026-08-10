import { TestBed } from '@angular/core/testing';

import {
  LAYER_PERSISTENCE,
  LayerService,
  VECTOR_LAYER_EXTENSIONS
} from '@igo2/geo';

import { provideOffline, withIndexedDb } from './offline.provider';
import { IndexedDbVectorLayerExtension } from './shared/indexed-db/indexed-db-vector-layer.extension';

describe('provideOffline', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('registers the indexeddb vector extension via feature API', () => {
    TestBed.configureTestingModule({
      providers: [provideOffline(withIndexedDb())]
    });

    const extensions = TestBed.inject(VECTOR_LAYER_EXTENSIONS);
    expect(Array.isArray(extensions)).toBe(true);
    expect(
      extensions.some(
        (extension) => extension instanceof IndexedDbVectorLayerExtension
      )
    ).toBe(true);
    expect(TestBed.inject(LAYER_PERSISTENCE)).toBeDefined();
  });

  it('resolves LayerService without a circular dependency', () => {
    TestBed.configureTestingModule({
      providers: [provideOffline(withIndexedDb())]
    });

    expect(TestBed.inject(LayerService)).toBeInstanceOf(LayerService);
  });
});
