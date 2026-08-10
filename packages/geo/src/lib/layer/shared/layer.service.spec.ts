import { TestBed } from '@angular/core/testing';

import { XHR_INTERCEPTOR } from '@igo2/core/auth';

import { firstValueFrom, of } from 'rxjs';

import { WMSDataSource } from '../../datasource/shared/datasources';
import { LayerService } from './layer.service';
import { ImageLayer } from './layers';
import { OFFLINE_LAYER_RESTORE } from './offline-layer-restore.interface';

describe('LayerService', () => {
  it('should configure authenticated image loading during layer creation', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: XHR_INTERCEPTOR,
          useValue: {
            alterUrlWithKeyAuth: vi.fn(),
            interceptXhr: vi.fn()
          }
        }
      ]
    });

    const source = new WMSDataSource({
      type: 'wms',
      url: 'https://example.com/wms',
      params: { LAYERS: 'test' }
    });
    const setImageLoadFunction = vi.spyOn(source.ol, 'setImageLoadFunction');

    const layer = TestBed.inject(LayerService).createLayer({
      title: 'Authenticated WMS',
      source
    });

    expect(layer).toBeInstanceOf(ImageLayer);
    expect(setImageLoadFunction).toHaveBeenCalledOnce();
  });

  it('returns an empty list when no offline restore provider is registered', async () => {
    TestBed.configureTestingModule({});

    const restoredLayers = await firstValueFrom(
      TestBed.inject(LayerService).createAsyncOfflineLayers('ctx-1')
    );

    expect(restoredLayers).toEqual([]);
  });

  it('delegates persisted-layer restoration to OFFLINE_LAYER_RESTORE when provided', async () => {
    const restoreMock = {
      createAsyncLayers: vi.fn(() => of([{ id: 'restored-layer' }]))
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: OFFLINE_LAYER_RESTORE,
          useValue: restoreMock
        }
      ]
    });

    const restoredLayers = await firstValueFrom(
      TestBed.inject(LayerService).createAsyncOfflineLayers('ctx-2')
    );

    expect(restoreMock.createAsyncLayers).toHaveBeenCalledWith('ctx-2');
    expect(restoredLayers).toEqual([{ id: 'restored-layer' }]);
  });
});
