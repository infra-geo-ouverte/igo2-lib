import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Message, MessageService } from '../message';

@Injectable()
export class RequestService {

  public counter$ = new BehaviorSubject<number>(0);

  constructor(private messageService: MessageService) { }

  register(request: Observable<any>, title?: string) {
    this.increment();

    return request
      .do((res) => this.handleError200(res))
      .catch((res) => this.handleError(res, title))
      .finally(this.decrement.call(this));
  }

  increment() {
    this.counter$.next(this.counter$.value + 1);
  }

  decrement() {
    this.counter$.next(this.counter$.value - 1);
  }

  private handleError200(res: Response | any) {
    if (!res || !res.headers) { return; }

    const contentType = res.headers.get('content-type');
    if (res.status === 200 && contentType.indexOf('application/json') === 0) {
      let body;
      try {
        body = res.json();
      } catch (e) {
        throw [{text: 'Invalid JSON received'}];
      }

      if (body.status < 200 || body.status >= 300) {
        throw res;
      }
    }
  }

  private handleError(res: Response | Message[], title?: string) {
    let messages: Message[];
    if (Array.isArray(res)) {
      messages = res as Message[];
    } else {
      messages = this.extractMessages(res as Response);
    }

    this.pushMessages(messages, title);

    return Observable.throw(res);
  }

  private extractMessages(res: Response): Message[] {
    if (!res || !res.headers) { return []; }

    let messages = [];

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') === 0) {
      const body = res.json() || {};
      if (body.messages) {
        messages = body.messages;
      }
    }

    return messages;
  }

  private pushMessages(messages, title?: string) {
    messages.forEach((message: Message) =>
      this.messageService.message(Object.assign({title: title}, message)));
  }

}
