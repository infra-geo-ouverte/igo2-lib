import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
// import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { RequestService } from '../../core';

import { DetailedContext } from './context.interface';

@Injectable()
export class ContextService {

  public context$ = new BehaviorSubject<DetailedContext>(undefined);

  constructor(private http: Http,
              private requestService: RequestService) { }

  // getContexts(): Observable<Context[]> {
  //   return this.requestService.register(
  //     this.http.get(`contexts/_contexts.json`)
  //   ).map(res => res.json());
  // }

  loadContext(url: string) {
    this.requestService.register(
      this.http.get(url), 'Context')
    .map(res => res.json())
    .subscribe(context => this.setContext(context));
  }

  setContext(context: DetailedContext) {
    this.context$.next(context);
  }

}
