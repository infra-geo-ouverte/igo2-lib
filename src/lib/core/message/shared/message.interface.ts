import { MessageType } from './message.enum';

export interface Message {
  title?: string;
  text: string;
  icon?: string;
  type?: MessageType;
  options?: any;
  format?: 'text' | 'html';
}

export interface MessageOptions {
  timeOut: number;
}
