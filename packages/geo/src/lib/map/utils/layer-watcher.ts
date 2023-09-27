import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { Watcher, SubjectStatus } from '@igo2/utils';
import { Layer, LinkedProperties } from '../../layer/shared/layers';
import { ObjectEvent } from 'ol/Object';

export class LayerWatcher extends Watcher {
  public propertyChange$: BehaviorSubject<{
    event: ObjectEvent;
    layer: Layer;
  }> = new BehaviorSubject(undefined);
  private loaded = 0;
  private loading = 0;
  private layers: Layer[] = [];
  private subscriptions: Subscription[] = [];

  constructor() {
    super();
  }

  watch() {}

  unwatch() {
    this.layers.forEach((layer) => this.unwatchLayer(layer), this);
  }

  setPropertyChange(change: ObjectEvent, layer: Layer) {
    if (
      ![
        LinkedProperties.TIMEFILTER,
        LinkedProperties.OGCFILTERS,
        LinkedProperties.VISIBLE,
        LinkedProperties.OPACITY,
        LinkedProperties.MINRESOLUTION,
        LinkedProperties.MAXRESOLUTION
      ].includes(change.key as any)
    ) {
      return;
    }
    this.propertyChange$.next({ event: change, layer });
  }

  watchLayer(layer: Layer) {
    if (layer.status$ === undefined) {
      return;
    }
    layer.ol.on('propertychange', (evt) => this.setPropertyChange(evt, layer));
    layer.dataSource.ol.on('propertychange', (evt) =>
      this.setPropertyChange(evt, layer)
    );

    this.layers.push(layer);

    const layer$$ = layer.status$
      .pipe(distinctUntilChanged())
      .subscribe((status) => {
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
    layer.ol.un('propertychange', (evt) => this.setPropertyChange(evt, layer));
    layer.dataSource.ol.un('propertychange', (evt) =>
      this.setPropertyChange(evt, layer)
    );
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
