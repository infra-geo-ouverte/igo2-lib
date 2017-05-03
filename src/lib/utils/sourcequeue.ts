import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { TileQueue } from './tilequeue';

export class SourceQueue {

  private subject$$: Subscription;
  private subject$ = new BehaviorSubject<boolean>(false);
  private loaded = 0;

  constructor(private map: ol.Map) {}

  subscribe(callback: Function, scope = null) {
    this.getSources().forEach(source => {
      if (source instanceof ol.source.TileImage) {
        new TileQueue(source).subscribe(this.handleSourceLoaded, this);
      } else {
        this.handleSourceLoaded();
      }
    }, this);

    this.subject$$ = this.subject$.subscribe((done) => {
      if (done) {
        this.subject$$.unsubscribe();
        this.subject$.next(false);
        this.loaded = 0;
        callback.call(scope, this.map);
      }
    });
  }

  private getSources(): ol.source.Source[] {
    return this.map.getLayers().getArray().map(layer =>
      (layer as ol.layer.Layer).getSource());
  }

  private handleSourceLoaded() {
    this.loaded += 1;
    if (this.loaded === this.map.getLayers().getLength()) {
      this.subject$.next(true);
    }
  }
}
