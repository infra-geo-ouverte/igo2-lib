import { Injectable } from '@angular/core';

import { uuid } from '@igo2/utils';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  public counter$ = new BehaviorSubject<number>(0);

  private ids: string[] = [];

  constructor() {}

  register(): string {
    const id = uuid();
    this.ids.push(id);
    this.counter$.next(this.ids.length);

    return id;
  }

  unregister(id: string) {
    const index = this.ids.indexOf(id);
    if (index === -1) {
      return;
    }
    this.ids.splice(index, 1);

    this.counter$.next(this.ids.length);
  }
}
