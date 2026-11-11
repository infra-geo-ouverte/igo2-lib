import { MessageType } from './message.enum';
import { IndividualToastConfig } from './toast';

export interface Message {
  title?: string;
  text: string;
  html?: string;
  type: MessageType;
  options?: MessageOptions;
  format?: 'text' | 'html';
  textInterpolateParams?: Record<string, unknown>;
  titleInterpolateParams?: Record<string, unknown>;
  showIcon?: boolean;
}

export interface MessageOptions extends IndividualToastConfig {
  template?: string;
  from?: Date | string;
  to?: Date | string;
  id?: number;
  showOnEachLayerVisibility?: boolean;
}
