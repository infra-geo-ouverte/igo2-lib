export interface Message {
  title?: string;
  text: string;
  type?: MessageType;
  format?: 'text' | 'html';
}

export interface MessageOptions {
  timeOut: number;
}

export enum MessageType {
  ERROR = <any> 'error',
  WARN = <any> 'warn',
  INFO = <any> 'info',
  SUCCESS = <any> 'success'
}
