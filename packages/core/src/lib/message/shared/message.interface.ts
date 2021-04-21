import { TemplateRef } from '@angular/core';
import { MessageType } from './message.enum';
import { Notification } from 'angular2-notifications';

export interface Message {
  title?: string;
  text?: string;
  html?: string | TemplateRef<any>;
  icon?: string;
  type?: MessageType;
  options?: MessageOptions;
  format?: 'text' | 'html';
}

export interface MessageOptions extends Notification {
  template?: string;
  from?: Date | string; // if the current date is the 2021-04-20, this date is included with this example new Date('2021-04-20')
  to?: Date | string; // if the current date is the 2021-04-21, this date is excluded with this example new Date('2021-04-21')
}
