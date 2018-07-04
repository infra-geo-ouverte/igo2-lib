import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Notification, NotificationsService } from 'angular2-notifications';

import { ConfigService } from '../../config/config.service';

import { Message, MessageOptions } from './message.interface';
import { MessageType } from './message.enum';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  public messages$ = new BehaviorSubject<Message[]>([]);
  private options: MessageOptions;

  constructor(
    private notificationService: NotificationsService,
    private configService: ConfigService
  ) {
    this.options = this.configService.getConfig('message') || {};
  }

  showError(httpError: HttpErrorResponse) {
    httpError.error.caught = true;
    return this.error(httpError.error.message, httpError.error.title);
  }

  message(message: Message) {
    this.messages$.next(this.messages$.value.concat([message]));

    message.options = message.options || {};
    message = this.handleTemplate(message);

    let notification;
    if (message.text) {
      notification = this.notificationService.create(
        message.title,
        message.text,
        (message.type as any) as string,
        message.options
      );
    } else if (message.html) {
      if (!message.icon) {
        message.options.theClass = message.options.theClass
          ? message.options.theClass + ' noIcon'
          : 'noIcon';
      }

      notification = this.notificationService.html(
        message.html,
        (message.type as any) as string,
        message.options
      );
    } else {
      return;
    }

    if (message.icon !== undefined) {
      this.addIcon(notification, message.icon);
    }

    return notification;
  }

  success(text: string, title?: string, options: any = {}) {
    return this.message({
      text: text,
      title: title,
      icon: options.icon || 'check',
      options: options,
      type: MessageType.SUCCESS
    });
  }

  error(text: string, title?: string, options: any = {}) {
    return this.message({
      text: text,
      title: title,
      icon: options.icon || 'error_outline',
      options: options,
      type: MessageType.ERROR
    });
  }

  info(text: string, title?: string, options: any = {}) {
    return this.message({
      text: text,
      title: title,
      icon: options.icon || 'info_outline',
      options: options,
      type: MessageType.INFO
    });
  }

  alert(text: string, title?: string, options: any = {}) {
    return this.message({
      text: text,
      title: title,
      icon: options.icon || 'access_alarm',
      options: options,
      type: MessageType.ALERT
    });
  }

  remove(id?) {
    this.notificationService.remove(id);
  }

  private addIcon(notification: Notification, icon: string) {
    // There is no way to add an icon to a notification when reating
    // it so we simply set it on the notification directly.
    // See https://github.com/flauc/angular2-notifications/issues/165
    notification.icon = `
      <mat-icon class="material-icons mat-icon mat-list-avatar">
        ${icon}
      </mat-icon>`;
  }

  private handleTemplate(message: Message): Message {
    if (!this.options.template || message.html) {
      return message;
    }

    let html = this.options.template;
    html = html.replace('${text}', message.text);
    html = html.replace('${title}', message.title);
    html = html.replace('${icon}', message.icon);

    message.html = html;
    message.text = undefined;
    message.title = undefined;
    message.icon = undefined;
    return message;
  }
}
