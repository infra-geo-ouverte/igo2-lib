import { DataSource } from '../../../datasource';

import { Layer } from './layer';
import { TileLayerOptions } from './tile-layer.interface';

export class TileLayer extends Layer {

  public dataSource: DataSource;
  public options: TileLayerOptions;
  public ol: ol.layer.Tile;

  constructor(dataSource: DataSource, options?: TileLayerOptions) {
    super(dataSource, options);
  }

  protected createOlLayer(): ol.layer.Tile {
    const olOptions = Object.assign({}, this.options.view || {}, {
      source: this.dataSource.ol as ol.source.TileImage
    });

    return new ol.layer.Tile(olOptions);
  }
}
