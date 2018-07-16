import Tile from 'ol/layer/tile';
import { DataSource } from '../../../datasource';

import { TileWatcher } from '../../utils';
import { IgoMap } from '../../../map';

import { Layer } from './layer';
import { TileLayerOptions } from './tile-layer.interface';


export class TileLayer extends Layer {

  public dataSource: DataSource;
  public options: TileLayerOptions;
  public ol: ol.layer.Tile;

  private watcher: TileWatcher;

  constructor(dataSource: DataSource, options?: TileLayerOptions) {
    super(dataSource, options);

    this.watcher = new TileWatcher(this.dataSource.ol as ol.source.Tile);
    this.status$ = this.watcher.status$;
  }

  protected createOlLayer(): ol.layer.Tile {
    const olOptions = Object.assign({}, this.options.view || {}, {
      source: this.dataSource.ol as ol.source.TileImage
    });

    return new Tile(olOptions);
  }

  public add(map: IgoMap) {
    this.watcher.subscribe(() => {});
    super.add(map);
  }

  public remove() {
    this.watcher.unsubscribe();
    super.remove();
  }
}
