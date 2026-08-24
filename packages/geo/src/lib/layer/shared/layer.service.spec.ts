import { TestBed } from '@angular/core/testing';

import { AuthInterceptor } from '@igo2/auth';

import { WMSDataSource } from '../../datasource/shared/datasources';
import { LayerService } from './layer.service';
import { ImageLayer } from './layers';

describe('LayerService', () => {
  it('should configure authenticated image loading during layer creation', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthInterceptor,
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
});
