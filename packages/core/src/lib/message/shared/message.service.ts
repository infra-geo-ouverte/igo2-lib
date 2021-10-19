import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

import { ConfigService } from '../../config/config.service';

import { Message, MessageOptions } from './message.interface';
import { ActiveToast, IndividualConfig, ToastrService } from 'ngx-toastr';
import { MessageType } from './message.enum';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  public messages$ = new BehaviorSubject<Message[]>([]);
  private options: MessageOptions;

  constructor(
    private configService: ConfigService,
    private toastr: ToastrService
  ) {
    this.options = this.configService.getConfig('message') || {};
  }

  showError(httpError: HttpErrorResponse) {
    httpError.error.caught = true;
    return this.error(httpError.error.message, httpError.error.title);
  }

  message(message: Message) {
    this.messages$.next(this.messages$.value.concat([message]));

    message.options = message.options || {} as MessageOptions;
    const currentDate = new Date();

    message.options.from = message.options.from ? message.options.from : new Date('1 jan 1900');
    message.options.to = message.options.to ? message.options.to : new Date('1 jan 3000');
    if (typeof message.options.from === 'string') {
      message.options.from = new Date(Date.parse(message.options.from.replace(/-/g, ' ')));
    }
    if (typeof message.options.to === 'string') {
      message.options.to = new Date(Date.parse(message.options.to.replace(/-/g, ' ')));
    }
    if (
      currentDate > message.options.from && currentDate < message.options.to) {

      message = this.handleTemplate(message);

      if (message.text) {
        let messageShown: ActiveToast<any>;
        switch (message.type) {
          case MessageType.SUCCESS:
            messageShown = this.success(message.text, message.title, message.options);
            break;
          case MessageType.ERROR:
            messageShown = this.error(message.text, message.title, message.options);
            break;
          case MessageType.INFO:
            messageShown = this.info(message.text, message.title, message.options);
            break;
          case MessageType.ALERT:
          case MessageType.WARNING:
            messageShown = this.alert(message.text, message.title, message.options);
            break;
          default:
            messageShown = this.info(message.text, message.title, message.options);
            break;
        }
        message.options.id = messageShown.toastId;
      }
    }
  }

  success(text: string, title?: string, options: Partial<IndividualConfig> = {}): ActiveToast<any> {
    return this.toastr.success(text, title, options);
  }

  error(text: string, title?: string, options: Partial<IndividualConfig> = {}): ActiveToast<any> {
    return this.toastr.error(text, title, options);
  }

  info(text: string, title?: string, options: Partial<IndividualConfig> = {}): ActiveToast<any> {
    return this.toastr.info(text, title, options);
  }

  alert(text: string, title?: string, options: Partial<IndividualConfig> = {}): ActiveToast<any> {
    return this.toastr.warning(text, title, options);
  }

  remove(id?: number) {
    this.toastr.remove(id);
  }

  removeAllAreNotError() {
    for (const mess of this.messages$.value) {
      if (mess.type !== MessageType.ERROR) {
        this.remove(mess.options.id);
      }
    }
  }

  private handleTemplate(message: Message): Message {
    if (!this.options.template || message.html) {
      return message;
    }

    let html = this.options.template;
    html = html.replace('${text}', message.text);
    html = html.replace('${title}', message.title);

    message.html = undefined;
    message.text = html;
    message.title = undefined;
    return message;
  }
}
