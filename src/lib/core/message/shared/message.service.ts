import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification, NotificationsService } from 'angular2-notifications';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Message } from './message.interface';
import { MessageType } from './message.enum';


@Injectable()
export class MessageService {

  public messages$ = new BehaviorSubject<Message[]>([]);

  constructor(private notificationService: NotificationsService) {}

  showError(httpError: HttpErrorResponse) {
    httpError.error.caught = true;
    this.error(httpError.error.message, httpError.error.title);
  }

  message(message: Message) {
    this.messages$.next(this.messages$.value.concat([message]));

    const notification = this.notificationService.create(
      message.title, message.text, message.type as any as string);

    if (message.icon !== undefined) {
      this.addIcon(notification, message.icon);
    }
  }

  html(message: Message) {
    this.messages$.next(this.messages$.value.concat([message]));

    this.notificationService.html(message.title, message.text);
  }

  success(text: string, title?: string, icon?: string) {
    this.message({
      text: text,
      title: title,
      icon: icon,
      type: MessageType.SUCCESS
    });
  }

  error(text: string, title?: string, icon?: string) {
    this.message({
      text: text,
      title: title,
      icon: icon,
      type: MessageType.ERROR
    });
  }

  info(text: string, title?: string, icon?: string) {
    this.message({
      text: text,
      title: title,
      icon: icon,
      type: MessageType.INFO
    });
  }

  alert(text: string, title?: string, icon?: string) {
    this.message({
      text: text,
      title: title,
      icon: icon,
      type: MessageType.ALERT
    });
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

}
