import TileLayerOl from 'ol/layer/Tile';
import TileSource from 'ol/source/Tile';

import { DataSource } from '../../../datasource';

import { TileWatcher } from '../../utils';
import { IgoMap } from '../../../map';

import { Layer } from './layer';
import { TileLayerOptions } from './tile-layer.interface';

export class TileLayer extends Layer {
  public dataSource: DataSource;
  public options: TileLayerOptions;
  public ol: TileLayerOl;

  private watcher: TileWatcher;

  constructor(options: TileLayerOptions) {
    super(options);

    this.watcher = new TileWatcher(this.options.source.ol as TileSource);
    this.status$ = this.watcher.status$;
  }

  protected createOlLayer(): TileLayerOl {
    const olOptions = Object.assign({}, this.options, {
      source: this.options.source.ol as TileSource
    });

    return new TileLayerOl(olOptions);
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
