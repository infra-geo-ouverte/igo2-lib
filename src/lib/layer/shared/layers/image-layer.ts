import { DataSource } from '../../../datasource';

import { Layer } from './layer';
import { ImageLayerOptions } from './image-layer.interface';


export class ImageLayer extends Layer {

  public options: ImageLayerOptions;
  public olLayer: ol.layer.Image;

  constructor(dataSource: DataSource, options: ImageLayerOptions) {
    super(dataSource, options);
  }

  protected createOlLayer(): ol.layer.Image {
    const layerOptions = Object.assign({}, this.options.view || {}, {
      source: this.dataSource.olSource as ol.source.Image
    });

    return new ol.layer.Image(layerOptions);
  }
}
