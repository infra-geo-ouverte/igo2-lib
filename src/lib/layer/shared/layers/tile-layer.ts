import { DataSource } from '../../../datasource';

import { Layer } from './layer';
import { TileLayerOptions } from './tile-layer.interface';

export class TileLayer extends Layer {

  public dataSource: DataSource;
  public options: TileLayerOptions;
  public olLayer: ol.layer.Tile;

  constructor(dataSource: DataSource, options: TileLayerOptions) {
    super(dataSource, options);
  }

  protected createOlLayer(): ol.layer.Tile {
    const olLayerOptions = Object.assign(this.options.view || {}, {
      source: this.dataSource.olSource as ol.source.TileImage
    });

    return new ol.layer.Tile(olLayerOptions);
  }
}
