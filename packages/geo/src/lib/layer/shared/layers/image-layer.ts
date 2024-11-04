import { AuthInterceptor } from '@igo2/auth';
import { MessageService } from '@igo2/core/message';

import olLayerImage from 'ol/layer/Image';
import olSourceImage from 'ol/source/Image';

import { ImageArcGISRestDataSource } from '../../../datasource/shared/datasources/imagearcgisrest-datasource';
import { WMSDataSource } from '../../../datasource/shared/datasources/wms-datasource';
import type { IgoMap } from '../../../map/shared/map';
import { ImageWatcher } from '../../utils/image-watcher';
import { ImageLayerOptions } from './image-layer.interface';
import { Layer } from './layer';

export class ImageLayer extends Layer {
  public declare dataSource: WMSDataSource | ImageArcGISRestDataSource;
  public declare options: ImageLayerOptions;
  public declare ol: olLayerImage<olSourceImage>;

  private watcher: ImageWatcher;

  constructor(
    options: ImageLayerOptions,
    public messageService: MessageService,
    public authInterceptor?: AuthInterceptor
  ) {
    super(options, messageService, authInterceptor);
    this.watcher = new ImageWatcher(this, this.messageService);
    this.status$ = this.watcher.status$;
    this.status$.subscribe((valStatus) => {
      if (valStatus === 0) {
        this.olLoadingProblem = true;
      }
    });
  }

  protected createOlLayer(): olLayerImage<olSourceImage> {
    const olOptions = Object.assign({}, this.options, {
      source: this.options.source.ol as olSourceImage
    });

    const image = new olLayerImage(olOptions);
    if (this.authInterceptor) {
      (image.getSource() as any).setImageLoadFunction((tile, src) => {
        this.customLoader(tile, src, this.authInterceptor, this.messageService);
      });
    }

    return image;
  }

  public setMap(map: IgoMap | undefined) {
    if (map === undefined) {
      this.watcher.unsubscribe();
    } else {
      this.watcher.subscribe(() => void 1);
    }
    super.setMap(map);
  }

  private customLoader(
    tile,
    src: string,
    interceptor: AuthInterceptor,
    messageService: MessageService
  ) {
    const xhr = new XMLHttpRequest();

    const alteredUrlWithKeyAuth = interceptor.alterUrlWithKeyAuth(src);
    let url = src;
    if (alteredUrlWithKeyAuth) {
      url = alteredUrlWithKeyAuth;
    }
    xhr.open('GET', url);
    const intercepted = interceptor.interceptXhr(xhr, url);
    if (!intercepted) {
      xhr.abort();
      tile.getImage().src = url;
      return;
    }

    xhr.responseType = 'arraybuffer';

    xhr.onload = function () {
      const arrayBufferView = new Uint8Array((this as any).response);
      const responseString = new TextDecoder().decode(arrayBufferView);
      if (responseString.includes('ServiceExceptionReport')) {
        messageService.error(
          'igo.geo.dataSource.optionsApiUnavailable',
          'igo.geo.dataSource.unavailableTitle'
        );
      }
      const blob = new Blob([arrayBufferView], { type: 'image/png' });
      const urlCreator = window.URL;
      const imageUrl = urlCreator.createObjectURL(blob);
      tile.getImage().src = imageUrl;
    };
    xhr.send();
  }
}
