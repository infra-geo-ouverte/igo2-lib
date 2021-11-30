import olLayerImage from 'ol/layer/Image';
import olSourceImage from 'ol/source/Image';

import { AuthInterceptor } from '@igo2/auth';

import { ImageWatcher } from '../../utils';
import { IgoMap } from '../../../map';

import { WMSDataSource } from '../../../datasource/shared/datasources/wms-datasource';

import { Layer } from './layer';
import { ImageLayerOptions } from './image-layer.interface';
import { ImageArcGISRestDataSource } from '../../../datasource/shared/datasources/imagearcgisrest-datasource';
import { GeoNetworkService } from '@igo2/core';
import { LanguageService, MessageService } from '@igo2/core';

export class ImageLayer extends Layer {
  public dataSource: WMSDataSource | ImageArcGISRestDataSource;
  public options: ImageLayerOptions;
  public ol: olLayerImage<olSourceImage>;

  private watcher: ImageWatcher;

  constructor(
    options: ImageLayerOptions,
    public messageService: MessageService,
    private geoNetwork: GeoNetworkService,
    private languageService: LanguageService,
    public authInterceptor?: AuthInterceptor
  ) {
    super(options, messageService, authInterceptor);
    this.watcher = new ImageWatcher(this, this.messageService, this.languageService);
    this.status$ = this.watcher.status$;
    this.status$.subscribe(valStatus => {
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
        this.customLoader(tile, src, this.authInterceptor, this.messageService, this.languageService);
      });
    }

    return image;
  }

  public setMap(map: IgoMap | undefined) {
    if (map === undefined) {
      this.watcher.unsubscribe();
    } else {
      this.watcher.subscribe(() => {});
    }
    super.setMap(map);
  }

/*  TODO VALIDATE IF USEFULL private customLoader(tile, src, interceptor, messageService, languageService) {
    const request = this.geoNetwork.get(src);
    request.pipe(first()).subscribe((blob) => {
      if (blob) {
        const buffer = blob.arrayBuffer();
        buffer.then((arrayBufferView) => {
          const responseString = new TextDecoder().decode(arrayBufferView);
          if (responseString.includes('ServiceExceptionReport')) {
            messageService.error(languageService.translate.instant(
              'igo.geo.dataSource.optionsApiUnavailable'
            ),
            languageService.translate.instant(
              'igo.geo.dataSource.unavailableTitle'
            ));
          }
        });
        const urlCreator = window.URL;
        const imageUrl = urlCreator.createObjectURL(blob);
        tile.getImage().src = imageUrl;
        tile.getImage().onload = function() {
          URL.revokeObjectURL(this.src);
        };*/
  private customLoader(tile, src: string, interceptor: AuthInterceptor, messageService: MessageService, languageService: LanguageService) {
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

    xhr.onload = function() {
      const arrayBufferView = new Uint8Array((this as any).response);
      const responseString = new TextDecoder().decode(arrayBufferView);
      if (responseString.includes('ServiceExceptionReport')) {
        messageService.error(languageService.translate.instant(
          'igo.geo.dataSource.optionsApiUnavailable'
        ),
        languageService.translate.instant(
          'igo.geo.dataSource.unavailableTitle'
        ));
      }
    };
  }
}
