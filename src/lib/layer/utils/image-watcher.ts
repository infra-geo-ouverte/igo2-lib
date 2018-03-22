import { uuid, Watcher, SubjectStatus } from '../../utils';


export class ImageWatcher extends Watcher {

  protected id: string;
  protected loaded = 0;
  protected loading = 0;

  constructor(private source: ol.source.Image) {
    super();
    this.id = uuid();
  }

  protected watch() {
    this.source.on(`imageloadstart`, this.handleLoadStart, this);
    this.source.on(`imageloadend`, this.handleLoadEnd, this);
    this.source.on(`imageloaderror`, this.handleLoadEnd, this);
  }

  protected unwatch() {
    this.source.un(`imageloadstart`, this.handleLoadStart, this);
    this.source.un(`imageloadend`, this.handleLoadEnd, this);
    this.source.un(`imageloaderror`, this.handleLoadEnd, this);
  }

  private handleLoadStart(event: any) {
    if (!event.image['__watchers__']) {
      event.image['__watchers__'] = [];
    }
    event.image['__watchers__'].push(this.id);

    this.loading += 1;
    this.status = SubjectStatus.Working;
  }

  private handleLoadEnd(event) {
    if (!event.image['__watchers__']) { return; }

    const watcherIndex = event.image['__watchers__'].indexOf(this.id);
    if (watcherIndex < 0) { return; }

    event.image['__watchers__'].splice(watcherIndex, 1);

    this.loaded += 1;

    const loading = this.loading;
    if (this.loaded >= loading) {
      if (loading === this.loading) {
        this.status =  SubjectStatus.Done;
        this.loaded = this.loading = 0;
      }
    }
  }
}
