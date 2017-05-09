import { DataSource } from '../../../datasource';

import { Layer } from './layer';
import { ImageLayerOptions } from './image-layer.interface';


export class ImageLayer extends Layer {

  public options: ImageLayerOptions;
  public ol: ol.layer.Image;

  constructor(dataSource: DataSource, options?: ImageLayerOptions) {
    super(dataSource, options);
  }

  protected createOlLayer(): ol.layer.Image {
    const olOptions = Object.assign({}, this.options.view || {}, {
      source: this.dataSource.ol as ol.source.Image
    });

    return new ol.layer.Image(olOptions);
  }
}
