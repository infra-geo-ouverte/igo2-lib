import { SubjectStatus, Watcher } from '@igo2/utils';

import BaseObject, { ObjectEvent } from 'ol/Object';
import LayerGroup from 'ol/layer/Group';

import {
  BehaviorSubject,
  Observable,
  Subscription,
  fromEvent,
  merge
} from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import type { AnyLayer, Layer, LayerId } from '../../layer/shared';
import { LinkedProperties } from '../../layer/shared/layers/linked/linked-layer.interface';

export interface LayerWatcherChange {
  event: LayerWatcherEvent;
  layer: Layer;
}

type LayerWatcherEvent = Pick<ObjectEvent, 'key' | 'oldValue'> & {
  value: unknown;
};

export class LayerWatcher extends Watcher {
  public propertyChange$ = new BehaviorSubject<LayerWatcherChange>(undefined);
  private loaded = 0;
  private loading = 0;
  private layers: Layer[] = [];
  private subscriptionsByLayerId = new Map<LayerId, Subscription[]>();
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

  setPropertyChange(change: LayerWatcherChange) {
    if (
      ![
        LinkedProperties.TIMEFILTER,
        LinkedProperties.OGCFILTERS,
        LinkedProperties.VISIBLE,
        LinkedProperties.OPACITY,
        LinkedProperties.MINRESOLUTION,
        LinkedProperties.MAXRESOLUTION,
        LinkedProperties.ZINDEX,
        LinkedProperties.DISPLAYED,
        LinkedProperties.REFRESH
      ].includes(change.event.key as any)
    ) {
      return;
    }
    this.propertyChange$.next(change);
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
    const displayed$: Observable<LayerWatcherChange> = layer.displayed$.pipe(
      map((value) => ({
        event: {
          key: 'displayed',
          oldValue: !value,
          value: layer.displayed
        },
        layer
      }))
    );
    const subscription = merge(
      this.createOlEventObservable(layer.ol, layer),
      this.createOlEventObservable(layer.dataSource.ol, layer),
      displayed$
    ).subscribe((change) => this.setPropertyChange(change));

    this.layers.push(layer);
    this.subscriptionsByLayerId.set(layer.id, [subscription]);
  }

  private createOlEventObservable(
    target: BaseObject,
    layer: Layer
  ): Observable<LayerWatcherChange> {
    return fromEvent<ObjectEvent>(target, 'propertychange').pipe(
      map((change) => ({
        event: { ...change, value: target.get(change.key) },
        layer
      }))
    );
  }

  unwatchLayer(layer: AnyLayer) {
    if (layer.ol instanceof LayerGroup) {
      return;
    }

    this._unwatchLayer(layer as Layer);
  }

  private _unwatchLayer(layer: Layer) {
    layer.status$.next(SubjectStatus.Done);

    this.subscriptionsByLayerId.get(layer.id)?.forEach((sub$) => {
      sub$.unsubscribe();
      this.subscriptionsByLayerId.delete(layer.id);
    });

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
