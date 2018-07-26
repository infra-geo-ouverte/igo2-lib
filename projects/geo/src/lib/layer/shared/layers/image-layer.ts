import * as ol from 'openlayers';

import { DataSource } from '../../../datasource';

import { ImageWatcher } from '../../utils';
import { IgoMap } from '../../../map';

import { Layer } from './layer';
import { ImageLayerOptions } from './image-layer.interface';

export class ImageLayer extends Layer {
  public options: ImageLayerOptions;
  public ol: ol.layer.Image;

  private watcher: ImageWatcher;

  constructor(dataSource: DataSource, options?: ImageLayerOptions) {
    super(dataSource, options);

    this.watcher = new ImageWatcher(this.dataSource.ol as ol.source.Image);
    this.status$ = this.watcher.status$;
  }

  protected createOlLayer(): ol.layer.Image {
    const olOptions: any = Object.assign({}, this.options.view || {}, {
      source: this.dataSource.ol as ol.source.Image
    });

    const image = new ol.layer.Image(olOptions);
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
