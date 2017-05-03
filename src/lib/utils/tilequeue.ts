import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

export class TileQueue {

  private subject$$: Subscription;
  private subject$ = new BehaviorSubject<boolean>(false);
  private loaded = 0;
  private loading = 0;
  private timeOut;

  constructor(private source: ol.source.Tile) {}

  subscribe(callback: Function, scope = null) {
    this.source.on(`tileloadstart`, this.handleLoadStart, this);
    this.source.on(`tileloadend`, this.handleLoadEnd, this);
    this.source.on(`tileloaderror`, this.handleLoadEnd, this);

    this.subject$$ = this.subject$.subscribe((done) => {
      if (this.timeOut !== undefined) {
        clearTimeout(this.timeOut);
        this.timeOut = undefined;
      }

      if (done) {
        this.subject$$.unsubscribe();
        this.subject$.next(false);
        this.loaded = 0;
        this.loading = 0;
        callback.call(scope, this.source);
      }
    });

    // If no tile started loading after 200ms, that means
    // no tile will be loaded but we still want the subject to emit
    const self = this;
    this.timeOut = window.setTimeout(() => {
      if (self.loading === 0 && self.subject$$ !== undefined) {
        this.subject$.next(true);
      }
    }, 200);
  }

  private handleLoadStart() {
    this.loading += 1;
  }

  private handleLoadEnd() {
    this.loaded += 1;

    if (this.loaded === this.loading) {
      this.subject$.next(true);
      this.source.un(`tileloadstart`, this.handleLoadStart, this);
      this.source.un(`tileloadend`, this.handleLoadEnd, this);
      this.source.un(`tileloaderror`, this.handleLoadEnd, this);
    }
  }
}
