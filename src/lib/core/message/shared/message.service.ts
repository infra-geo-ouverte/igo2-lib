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
    return this.error(httpError.error.message, httpError.error.title);
  }

  message(message: Message) {
    this.messages$.next(this.messages$.value.concat([message]));

    const notification = this.notificationService.create(
      message.title, message.text, message.type as any as string, message.options
    );

    if (message.icon !== undefined) {
      this.addIcon(notification, message.icon);
    }

    return notification;
  }

  html(message: Message) {
    this.messages$.next(this.messages$.value.concat([message]));

    const notification = this.notificationService.html(
      message.text, message.type as any as string, message.options
    );

    if (message.icon !== undefined) {
      this.addIcon(notification, message.icon);
    }

    return notification;
  }

  success(text: string, title?: string, options: any = {}) {
    return this.message({
      text: text,
      title: title,
      icon: options.icon,
      options: options,
      type: MessageType.SUCCESS
    });
  }

  error(text: string, title?: string, options: any = {}) {
    return this.message({
      text: text,
      title: title,
      icon: options.icon,
      options: options,
      type: MessageType.ERROR
    });
  }

  info(text: string, title?: string, options: any = {}) {
    return this.message({
      text: text,
      title: title,
      icon: options.icon,
      options: options,
      type: MessageType.INFO
    });
  }

  alert(text: string, title?: string, options: any = {}) {
    return this.message({
      text: text,
      title: title,
      icon: options.icon,
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

}
