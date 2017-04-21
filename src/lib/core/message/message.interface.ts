export interface Message {
  title?: string;
  text: string;
  type?: MessageType;
  format?: 'text' | 'html';
}

export interface MessageOptions {
  timeOut: number;
}
