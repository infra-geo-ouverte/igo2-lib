import olSourceTile from 'ol/source/Tile';
import { uuid, Watcher, SubjectStatus } from '@igo2/utils';

import { TileLayer } from '../shared/layers/tile-layer';
import { VectorTileLayer } from '../shared/layers/vectortile-layer';

export class TileWatcher extends Watcher {
  private id: string;
  private loaded = 0;
  private loading = 0;

  private source: olSourceTile;

  constructor(layer: TileLayer | VectorTileLayer) {
    super();
    this.source = layer.options.source.ol;
    this.id = uuid();
  }

  protected watch() {
    this.source.on(`tileloadstart`, (e) => this.handleLoadStart(e));
    this.source.on(`tileloadend`, (e) => this.handleLoadEnd(e));
    this.source.on(`tileloaderror`, (e) => this.handleLoadEnd(e));
  }

  protected unwatch() {
    this.source.un(`tileloadstart`, (e) => this.handleLoadStart(e));
    this.source.un(`tileloadend`, (e) => this.handleLoadEnd(e));
    this.source.un(`tileloaderror`, (e) => this.handleLoadEnd(e));
  }

  private handleLoadStart(event: any) {
    // This is to avoid increasing
    // the number of loaded tiles if a tile was loading
    // before subscribing to this watcher
    if (!event.tile.__watchers__) {
      event.tile.__watchers__ = [];
    }
    event.tile.__watchers__.push(this.id);

    this.loading += 1;
    this.status = SubjectStatus.Working;
  }

  private handleLoadEnd(event) {
    if (!event.tile.__watchers__) {
      return;
    }

    const watcherIndex = event.tile.__watchers__.indexOf(this.id);
    if (watcherIndex < 0) {
      return;
    }

    event.tile.__watchers__.splice(watcherIndex, 1);

    this.loaded += 1;

    const loading = this.loading;
    if (this.loaded >= loading) {
      if (loading === this.loading) {
        this.status = SubjectStatus.Done;
        this.loaded = this.loading = 0;
      }
    }
  }
}
