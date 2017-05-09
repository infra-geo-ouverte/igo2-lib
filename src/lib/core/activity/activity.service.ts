import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { uuid } from '../../utils/uuid';


@Injectable()
export class ActivityService {

  public counter$ = new BehaviorSubject<number>(0);

  private ids: string[] = [];

  constructor() { }

  register(): string {
    const id = uuid();
    this.ids.push(id);
    this.counter$.next(this.ids.length);

    return id;
  }

  unregister(id: string) {
    this.ids.splice(this.ids.indexOf(id), 1);
    this.counter$.next(this.ids.length);
  }

}
