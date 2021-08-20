import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { Watcher, SubjectStatus } from '@igo2/utils';
import { Layer } from '../../layer/shared/layers';

export class LayerWatcher extends Watcher {
  private loaded = 0;
  private loading = 0;
  private layers: Layer[] = [];
  private subscriptions: Subscription[] = [];

  constructor() {
    super();
  }

  watch() {}

  unwatch() {
    this.layers.forEach(layer => this.unwatchLayer(layer), this);
  }

  watchLayer(layer: Layer) {
    if (layer.status$ === undefined) {
      return;
    }

    this.layers.push(layer);

    const layer$$ = layer.status$
      .pipe(distinctUntilChanged())
      .subscribe(status => {
        if (status === SubjectStatus.Error) {
          this.loading = 0;
          this.loaded = -1;
        }
        if (status === SubjectStatus.Working) {
          this.loading += 1;
        } else if (status === SubjectStatus.Done) {
          this.loaded += 1;
        }

        if (this.loaded >= this.loading) {
          this.loading = this.loaded = 0;
          this.status = SubjectStatus.Done;
        } else if (this.loading > 0) {
          this.status = SubjectStatus.Working;
        }
      });

    this.subscriptions.push(layer$$);
  }

  unwatchLayer(layer: Layer) {
    layer.status$.next(SubjectStatus.Done);
    const index = this.layers.indexOf(layer);
    if (index >= 0) {
      const status = (layer as any).watcher.status;
      if (
        [SubjectStatus.Working, SubjectStatus.Waiting].indexOf(status) !== -1
      ) {
        this.loaded += 1;
      }
      this.subscriptions[index].unsubscribe();
      this.subscriptions.splice(index, 1);
      this.layers.splice(index, 1);
      (layer as any).watcher.unwatch();
    }
  }
}
