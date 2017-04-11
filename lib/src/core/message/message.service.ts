import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Message } from './message.interface';


@Injectable()
export class MessageService {

  public messages$ = new BehaviorSubject<Message[]>([]);

  constructor() { }

  message(message: Message) {
    const messages_ = this.messages$.value;
    messages_.push(message);

    this.messages$.next(messages_);
  }

}
