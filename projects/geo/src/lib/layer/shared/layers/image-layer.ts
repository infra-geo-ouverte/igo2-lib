import ImageLayerOL from 'ol/layer/Image';
import ImageSource from 'ol/source/Image';

import { ImageWatcher } from '../../utils';
import { IgoMap } from '../../../map';

import { WMSDataSource } from '../../../datasource/shared/datasources/wms-datasource';

import { Layer } from './layer';
import { ImageLayerOptions } from './image-layer.interface';

export class ImageLayer extends Layer {
  public dataSource: WMSDataSource;
  public options: ImageLayerOptions;
  public ol: ImageLayerOL;

  private watcher: ImageWatcher;

  constructor(options: ImageLayerOptions) {
    super(options);

    this.watcher = new ImageWatcher(this);
    this.status$ = this.watcher.status$;
  }

  protected createOlLayer(): ImageLayerOL {
    const olOptions = Object.assign({}, this.options, {
      source: this.options.source.ol as ImageSource
    });

    const image = new ImageLayerOL(olOptions);
    const token = this.options.token;
    if (token) {
      const self = this;
      (image.getSource() as any).setImageLoadFunction(function(tile, src) {
        self.customLoader(tile, src, token);
      });
    }

    return image;
  }

  public add(map: IgoMap) {
    this.watcher.subscribe(() => {});
    super.add(map);
  }

  public remove() {
    this.watcher.unsubscribe();
    super.remove();
  }

  private customLoader(tile, src, token?) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', src);

    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function() {
      const arrayBufferView = new Uint8Array((this as any).response);
      const blob = new Blob([arrayBufferView], { type: 'image/png' });
      const urlCreator = window.URL;
      const imageUrl = urlCreator.createObjectURL(blob);
      tile.getImage().src = imageUrl;
    };
    xhr.send();
  }
}
