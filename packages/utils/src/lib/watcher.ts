import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export enum SubjectStatus {
  Error = 0,
  Done = 1,
  Working = 2,
  Waiting = 3
}

export abstract class Watcher {
  public status$ = new Subject<SubjectStatus>();
  protected status$$: Subscription;

  get status(): SubjectStatus {
    return this._status;
  }
  set status(value: SubjectStatus) {
    this._status = value;
    this.status$.next(value);
  }
  private _status: SubjectStatus;

  protected abstract watch();

  protected abstract unwatch();

  // eslint-disable-next-line @typescript-eslint/ban-types
  subscribe(callback: Function, scope?: any) {
    this.watch();

    this.status$$ = this.status$
      .pipe(distinctUntilChanged())
      .subscribe((status: SubjectStatus) => {
        this.handleStatusChange(status);
        callback.call(scope, this);
      });
  }

  unsubscribe() {
    this.unwatch();
    if (this.status$$ !== undefined) {
      this.status$$.unsubscribe();
      this.status$$ = undefined;
    }
    this.status = SubjectStatus.Waiting;
  }

  protected handleStatusChange(status: SubjectStatus) {}
}
