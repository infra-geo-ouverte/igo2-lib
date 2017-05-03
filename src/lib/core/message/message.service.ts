import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Message } from './message.interface';
import { MessageType } from './message.enum';


@Injectable()
export class MessageService {

  public messages$ = new BehaviorSubject<Message[]>([]);

  constructor() { }

  message(message: Message) {
    const messages_ = this.messages$.value;
    messages_.push(message);

    this.messages$.next(messages_);
  }

  success(text: string, title?) {
    this.message({
      text: text,
      title: title,
      type: MessageType.SUCCESS
    });
  }

  error(text: string, title?) {
    this.message({
      text: text,
      title: title,
      type: MessageType.ERROR
    });
  }

}
