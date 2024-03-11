import { MessageService } from '@igo2/core/message';
import { SubjectStatus, Watcher, uuid } from '@igo2/utils';

import olSourceImage from 'ol/source/Image';

import type { ImageLayer } from '../shared/layers/image-layer';

export class ImageWatcher extends Watcher {
  protected id: string;
  protected loaded = 0;
  protected loading = 0;

  private source: olSourceImage;

  private messageService: MessageService;

  constructor(layer: ImageLayer, messageService: MessageService) {
    super();
    this.source = layer.options.source.ol;
    this.id = uuid();
    this.messageService = messageService;
  }

  protected watch() {
    this.source.on(`imageloadstart`, (e) => this.handleLoadStart(e));
    this.source.on(`imageloadend`, (e) => this.handleLoadEnd(e));
    this.source.on(`imageloaderror`, (e) => this.handleLoadEnd(e));
    this.source.on(`imageloaderror`, (e) => this.handleLoadError(e));
  }

  protected unwatch() {
    this.source.un(`imageloadstart`, (e) => this.handleLoadStart(e));
    this.source.un(`imageloadend`, (e) => this.handleLoadEnd(e));
    this.source.un(`imageloaderror`, (e) => this.handleLoadEnd(e));
    this.source.un(`imageloaderror`, (e) => this.handleLoadError(e));
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

  private handleLoadError(event) {
    if (!event.image.__watchers__) {
      return;
    }
    this.messageService.error(
      'igo.geo.dataSource.unavailable',
      'igo.geo.dataSource.unavailableTitle',
      undefined,
      { value: event.target.params_.LAYERS }
    );
    this.loaded = -1;
    this.loading = 0;
    this.status = SubjectStatus.Error;
  }
}
