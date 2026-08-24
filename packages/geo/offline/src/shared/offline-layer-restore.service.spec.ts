import { TestBed } from '@angular/core/testing';

import { LayerService } from '@igo2/geo';

import { firstValueFrom, of } from 'rxjs';

import { LayerDB } from '../layer';
import { LayerDBData } from '../layer/layer-db.interface';
import { OfflineLayerRestoreService } from './offline-layer-restore.service';

describe('OfflineLayerRestoreService', () => {
  const persistedLayers: LayerDBData[] = [
    {
      layerId: 'l1',
      detailedContextUri: 'ctx-a',
      sourceOptions: { type: 'wfs', url: 'https://example.com/a' },
      layerOptions: { id: 'l1', title: 'Layer A' },
      insertEvent: 'event-a'
    },
    {
      layerId: 'l2',
      detailedContextUri: 'ctx-b',
      sourceOptions: { type: 'wfs', url: 'https://example.com/b' },
      layerOptions: { id: 'l2', title: 'Layer B' },
      insertEvent: 'event-b'
    }
  ];

  let layerDbMock: {
    getAll: ReturnType<typeof vi.fn>;
  };
  let layerServiceMock: {
    createAsyncLayer: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    layerDbMock = {
      getAll: vi.fn(() => of(persistedLayers))
    };

    layerServiceMock = {
      createAsyncLayer: vi.fn((options) => of({ id: options.id }))
    };

    TestBed.configureTestingModule({
      providers: [
        OfflineLayerRestoreService,
        { provide: LayerDB, useValue: layerDbMock },
        { provide: LayerService, useValue: layerServiceMock }
      ]
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('restores all persisted layers when contextUri is wildcard', async () => {
    const restoredLayers = await firstValueFrom(
      TestBed.inject(OfflineLayerRestoreService).createAsyncLayers('*')
    );

    expect(layerDbMock.getAll).toHaveBeenCalledOnce();
    expect(layerServiceMock.createAsyncLayer).toHaveBeenCalledTimes(2);
    expect(restoredLayers).toEqual([{ id: 'l1' }, { id: 'l2' }]);
  });

  it('restores only layers from the requested context', async () => {
    const restoredLayers = await firstValueFrom(
      TestBed.inject(OfflineLayerRestoreService).createAsyncLayers('ctx-a')
    );

    expect(layerServiceMock.createAsyncLayer).toHaveBeenCalledTimes(1);
    expect(layerServiceMock.createAsyncLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'l1',
        sourceOptions: { type: 'wfs', url: 'https://example.com/a' }
      })
    );
    expect(restoredLayers).toEqual([{ id: 'l1' }]);
  });

  it('returns an empty list when persisted layers do not match context', async () => {
    const restoredLayers = await firstValueFrom(
      TestBed.inject(OfflineLayerRestoreService).createAsyncLayers(
        'ctx-unknown'
      )
    );

    expect(layerServiceMock.createAsyncLayer).not.toHaveBeenCalled();
    expect(restoredLayers).toEqual([]);
  });

  it('uses the layer id as source URL when persisted features have no URL', async () => {
    layerDbMock.getAll.mockReturnValue(
      of([
        {
          layerId: 'imported-layer',
          detailedContextUri: 'ctx-a',
          sourceOptions: { type: 'vector' },
          layerOptions: { id: 'imported-layer', title: 'Imported layer' },
          insertEvent: 'event-imported'
        }
      ])
    );

    await firstValueFrom(
      TestBed.inject(OfflineLayerRestoreService).createAsyncLayers('ctx-a')
    );

    expect(layerServiceMock.createAsyncLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        offline: { enabled: true, contextUri: 'ctx-a' },
        sourceOptions: { type: 'vector', url: 'imported-layer' }
      })
    );
  });
});
