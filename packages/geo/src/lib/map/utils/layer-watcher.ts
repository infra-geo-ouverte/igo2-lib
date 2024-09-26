import { SubjectStatus, Watcher } from '@igo2/utils';

import { ObjectEvent } from 'ol/Object';
import LayerGroup from 'ol/layer/Group';

import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { AnyLayer } from '../../layer/shared/layers/any-layer';
import { Layer } from '../../layer/shared/layers/layer';
import { LinkedProperties } from '../../layer/shared/layers/layer.interface';

export class LayerWatcher extends Watcher {
  public propertyChange$ = new BehaviorSubject<{
    event: ObjectEvent;
    layer: Layer;
  }>(undefined);
  private loaded = 0;
  private loading = 0;
  private layers: Layer[] = [];
  private subscriptions: Subscription[] = [];

  constructor() {
    super();
  }

  watch() {
    // empty watch
  }

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

  watchLayer(layer: AnyLayer) {
    if (layer.status$ === undefined) {
      return;
    }

    if (layer.ol instanceof LayerGroup) {
      return;
    }

    this._watchLayer(layer as Layer);

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

  private _watchLayer(layer: Layer) {
    layer.ol.on('propertychange', (evt) => this.setPropertyChange(evt, layer));
    layer.dataSource.ol.on('propertychange', (evt) =>
      this.setPropertyChange(evt, layer)
    );

    this.layers.push(layer);
  }

  unwatchLayer(layer: AnyLayer) {
    if (layer.ol instanceof LayerGroup) {
      return;
    }

    this._unwatchLayer(layer as Layer);
  }

  private _unwatchLayer(layer: Layer) {
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
