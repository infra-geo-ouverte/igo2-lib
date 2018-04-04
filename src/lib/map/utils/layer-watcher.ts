import { Subscription } from 'rxjs/Subscription';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';

import { Watcher, SubjectStatus } from '../../utils';
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
    if (layer.status$ === undefined) { return; }

    this.layers.push(layer);

    const layer$$ = layer.status$.pipe(
      distinctUntilChanged()
    ).subscribe(status => {
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
    const index = this.layers.indexOf(layer);
    if (index >= 0) {
      const status = (layer as any).watcher.status;
      if ([SubjectStatus.Working, SubjectStatus.Waiting].includes(status)) {
        this.loaded += 1;
      }
      this.subscriptions[index].unsubscribe();
      this.subscriptions.splice(index, 1);
      this.layers.splice(index, 1);
    }
  }
}
