import { uuid, Watcher, SubjectStatus } from '../../utils';

export class TileWatcher extends Watcher {
  private id: string;
  private loaded = 0;
  private loading = 0;

  constructor(private source: ol.source.Tile) {
    super();
    this.id = uuid();
  }

  protected watch() {
    this.source.on(`tileloadstart`, this.handleLoadStart, this);
    this.source.on(`tileloadend`, this.handleLoadEnd, this);
    this.source.on(`tileloaderror`, this.handleLoadEnd, this);
  }

  protected unwatch() {
    this.source.un(`tileloadstart`, this.handleLoadStart, this);
    this.source.un(`tileloadend`, this.handleLoadEnd, this);
    this.source.un(`tileloaderror`, this.handleLoadEnd, this);
  }

  private handleLoadStart(event: any) {
    // This is to avoid increasing
    // the number of loaded tiles if a tile was loading
    // before subscribing to this watcher
    if (!event.tile['__watchers__']) {
      event.tile['__watchers__'] = [];
    }
    event.tile['__watchers__'].push(this.id);

    this.loading += 1;
    this.status = SubjectStatus.Working;
  }

  private handleLoadEnd(event) {
    if (!event.tile['__watchers__']) {
      return;
    }

    const watcherIndex = event.tile['__watchers__'].indexOf(this.id);
    if (watcherIndex < 0) {
      return;
    }

    event.tile['__watchers__'].splice(watcherIndex, 1);

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
