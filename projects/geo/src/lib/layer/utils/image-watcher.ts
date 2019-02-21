import olSourceImage from 'ol/source/Image';
import { uuid, Watcher, SubjectStatus } from '@igo2/utils';

import { ImageLayer } from '../shared/layers/image-layer';

export class ImageWatcher extends Watcher {
  protected id: string;
  protected loaded = 0;
  protected loading = 0;

  private source: olSourceImage;

  constructor(layer: ImageLayer) {
    super();
    this.source = layer.options.source.ol;
    this.id = uuid();
  }

  protected watch() {
    this.source.on(`imageloadstart`, e => this.handleLoadStart(e));
    this.source.on(`imageloadend`, e => this.handleLoadEnd(e));
    this.source.on(`imageloaderror`, e => this.handleLoadEnd(e));
  }

  protected unwatch() {
    this.source.un(`imageloadstart`, e => this.handleLoadStart(e));
    this.source.un(`imageloadend`, e => this.handleLoadEnd(e));
    this.source.un(`imageloaderror`, e => this.handleLoadEnd(e));
  }

  private handleLoadStart(event: any) {
    if (!event.image.__watchers__) {
      event.image.__watchers__ = [];
    }
    event.image.__watchers__.push(this.id);

    this.loading += 1;
    this.status = SubjectStatus.Working;
  }

  private handleLoadEnd(event) {
    if (!event.image.__watchers__) {
      return;
    }

    const watcherIndex = event.image.__watchers__.indexOf(this.id);
    if (watcherIndex < 0) {
      return;
    }

    event.image.__watchers__.splice(watcherIndex, 1);

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
