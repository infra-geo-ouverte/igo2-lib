import { TemplateRef } from '@angular/core';

import { IndividualConfig } from 'ngx-toastr';

import { MessageType } from './message.enum';

export interface Message {
  title?: string;
  text: string;
  html?: string | TemplateRef<unknown>;
  type: MessageType;
  options?: MessageOptions;
  format?: 'text' | 'html';
  textInterpolateParams?: Record<string, unknown>;
  titleInterpolateParams?: Record<string, unknown>;
  showIcon?: boolean;
}

export interface MessageOptions extends IndividualConfig {
  template?: string;
  from?: Date | string;
  to?: Date | string;
  id?: number;
  showOnEachLayerVisibility?: boolean;
}
