import { TestBed } from '@angular/core/testing';

import type { AnyLayer } from '@igo2/geo';

import { of } from 'rxjs';

import { GeoDB } from '../../geo';
import { LayerDB } from '../../layer';
import { IndexedDbLayerPersistenceService } from './indexed-db-layer-persistence.service';

describe('IndexedDbLayerPersistenceService', () => {
  let geoDBMock: { delete: ReturnType<typeof vi.fn> };
  let layerDBMock: { delete: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    geoDBMock = { delete: vi.fn(() => of({})) };
    layerDBMock = { delete: vi.fn(() => of({})) };

    TestBed.configureTestingModule({
      providers: [
        IndexedDbLayerPersistenceService,
        { provide: GeoDB, useValue: geoDBMock },
        { provide: LayerDB, useValue: layerDBMock }
      ]
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('deletes persisted feature data by source URL and metadata by layer id', () => {
    const layer = {
      id: 'layer-1',
      type: 'vector',
      options: {
        offline: { enabled: true },
        sourceOptions: { url: 'https://example.com/wfs' }
      }
    } as unknown as AnyLayer;

    const service = TestBed.inject(IndexedDbLayerPersistenceService);
    service.removePersistedData(layer);

    expect(geoDBMock.delete).toHaveBeenCalledWith('https://example.com/wfs');
    expect(layerDBMock.delete).toHaveBeenCalledWith('layer-1');
  });

  it('uses the layer id for imported feature data without a source URL', () => {
    const layer = {
      id: 'imported-layer',
      type: 'vector',
      options: {
        offline: { enabled: true },
        sourceOptions: { type: 'vector' }
      }
    } as unknown as AnyLayer;

    TestBed.inject(IndexedDbLayerPersistenceService).removePersistedData(layer);

    expect(geoDBMock.delete).toHaveBeenCalledWith('imported-layer');
    expect(layerDBMock.delete).toHaveBeenCalledWith('imported-layer');
  });

  it('does not delete data for layers without persistence capability', () => {
    const layer = {
      id: 'online-layer',
      type: 'vector',
      options: {}
    } as unknown as AnyLayer;

    TestBed.inject(IndexedDbLayerPersistenceService).removePersistedData(layer);

    expect(geoDBMock.delete).not.toHaveBeenCalled();
    expect(layerDBMock.delete).not.toHaveBeenCalled();
  });
});
