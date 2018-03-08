import { MessageType } from './message.enum';

export interface Message {
  id?: string;
  title?: string;
  text: string;
  icon?: string;
  type?: MessageType;
  format?: 'text' | 'html';
}

export interface MessageOptions {
  timeOut: number;
}
