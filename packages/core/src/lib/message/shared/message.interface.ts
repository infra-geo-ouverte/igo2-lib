import { TemplateRef } from '@angular/core';
import { MessageType } from './message.enum';
import { IndividualConfig } from 'ngx-toastr';

export interface Message {
  title?: string;
  text?: string;
  html?: string | TemplateRef<any>;
  type?: MessageType;
  options?: MessageOptions;
  format?: 'text' | 'html';
  noIcon?: boolean
}

export interface MessageOptions extends IndividualConfig {
  template?: string;
  from?: Date | string;
  to?: Date | string;
  id?: number;
  showOnEachLayerVisibility?: boolean;
}
