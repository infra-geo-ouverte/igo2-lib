import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';

import { BehaviorSubject } from 'rxjs';

import { MessageType } from './message.enum';
import { Message, MessageOptions } from './message.interface';
import { ActiveToast, IndividualToastConfig, ToastService } from './toast';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private configService = inject(ConfigService);
  private languageService = inject(LanguageService);
  private toastService = inject(ToastService);

  public messages$ = new BehaviorSubject<Message[]>([]);
  private options?: MessageOptions;

  constructor() {
    this.options = this.configService.getConfig('message');
  }

  showError(httpError: HttpErrorResponse) {
    const errorPayload = httpError.error as
      { caught?: boolean; message?: string; title?: string } | undefined;

    if (errorPayload && typeof errorPayload === 'object') {
      errorPayload.caught = true;
    }

    const message =
      typeof errorPayload?.message === 'string'
        ? errorPayload.message
        : httpError.message;
    const title =
      typeof errorPayload?.title === 'string'
        ? errorPayload.title
        : 'igo.core.message.error';

    return this.error(message, title);
  }

  message(message: Message) {
    this.messages$.next(this.messages$.value.concat([message]));

    const options = { ...(message.options ?? {}) } as MessageOptions;
    const currentDate = new Date();
    const fromDate = this.parseDate(options.from, new Date('1 jan 1900'));
    const toDate = this.parseDate(options.to, new Date('1 jan 3000'));

    options.from = fromDate;
    options.to = toDate;

    if (message.showIcon !== undefined) {
      options.showIcon = message.showIcon;
    }

    if (currentDate >= fromDate && currentDate <= toDate) {
      message = this.handleTemplate(message);

      if (message.text) {
        let messageShown: ActiveToast;
        switch (message.type) {
          case MessageType.SUCCESS:
            messageShown = this.success(
              message.text,
              message.title,
              options,
              message.textInterpolateParams,
              message.titleInterpolateParams
            );
            break;
          case MessageType.ERROR:
            messageShown = this.error(
              message.text,
              message.title,
              options,
              message.textInterpolateParams,
              message.titleInterpolateParams
            );
            break;
          case MessageType.INFO:
          case MessageType.SHOW:
            messageShown = this.info(
              message.text,
              message.title,
              options,
              message.textInterpolateParams,
              message.titleInterpolateParams
            );
            break;
          case MessageType.ALERT:
          case MessageType.WARNING:
            messageShown = this.alert(
              message.text,
              message.title,
              options,
              message.textInterpolateParams,
              message.titleInterpolateParams
            );
            break;
          default:
            messageShown = this.info(
              message.text,
              message.title,
              options,
              message.textInterpolateParams,
              message.titleInterpolateParams
            );
            break;
        }
        options.id = messageShown.toastId;
        message.options = options;
      }
    }
  }

  success(
    text: string,
    title = 'igo.core.message.success',
    options: IndividualToastConfig = {},
    textInterpolateParams?: Record<string, unknown>,
    titleInterpolateParams?: Record<string, unknown>
  ): ActiveToast {
    return this.handleToast(
      'success',
      text,
      title,
      options,
      textInterpolateParams,
      titleInterpolateParams
    );
  }

  error(
    text: string,
    title = 'igo.core.message.error',
    options: IndividualToastConfig = {},
    textInterpolateParams?: Record<string, unknown>,
    titleInterpolateParams?: Record<string, unknown>
  ): ActiveToast {
    return this.handleToast(
      'error',
      text,
      title,
      options,
      textInterpolateParams,
      titleInterpolateParams
    );
  }

  info(
    text: string,
    title = 'igo.core.message.info',
    options: IndividualToastConfig = {},
    textInterpolateParams?: Record<string, unknown>,
    titleInterpolateParams?: Record<string, unknown>
  ): ActiveToast {
    return this.handleToast(
      'info',
      text,
      title,
      options,
      textInterpolateParams,
      titleInterpolateParams
    );
  }

  alert(
    text: string,
    title = 'igo.core.message.alert',
    options: IndividualToastConfig = {},
    textInterpolateParams?: Record<string, unknown>,
    titleInterpolateParams?: Record<string, unknown>
  ): ActiveToast {
    return this.handleToast(
      'warning',
      text,
      title,
      options,
      textInterpolateParams,
      titleInterpolateParams
    );
  }

  show(
    text: string,
    title = 'igo.core.message.info',
    options: IndividualToastConfig = {},
    textInterpolateParams?: Record<string, unknown>,
    titleInterpolateParams?: Record<string, unknown>
  ): ActiveToast {
    return this.handleToast(
      'info',
      text,
      title,
      options,
      textInterpolateParams,
      titleInterpolateParams
    );
  }

  private handleToast(
    type: 'warning' | 'info' | 'error' | 'success',
    text: string,
    title: string,
    options: IndividualToastConfig = {},
    textInterpolateParams?: Record<string, unknown>,
    titleInterpolateParams?: Record<string, unknown>
  ): ActiveToast {
    const translatedTextInterpolateParams = this.translateInterpolateParams(
      textInterpolateParams
    );
    const translatedTitleInterpolateParams = this.translateInterpolateParams(
      titleInterpolateParams
    );

    const translatedMessage = this.languageService.translate.instant(
      text,
      translatedTextInterpolateParams
    );
    const translatedTitle = this.languageService.translate.instant(
      title,
      translatedTitleInterpolateParams
    );

    let activeToast: ActiveToast;
    switch (type) {
      case 'success':
        activeToast = this.toastService.success(
          translatedMessage,
          translatedTitle,
          options
        );
        break;
      case 'error':
        activeToast = this.toastService.error(
          translatedMessage,
          translatedTitle,
          options
        );
        break;
      case 'info':
        activeToast = this.toastService.info(
          translatedMessage,
          translatedTitle,
          options
        );
        break;
      case 'warning':
        activeToast = this.toastService.warning(
          translatedMessage,
          translatedTitle,
          options
        );
        break;
    }

    return activeToast;
  }

  private parseDate(value: Date | string | undefined, fallback: Date): Date {
    if (!value) {
      return fallback;
    }

    if (value instanceof Date) {
      return value;
    }

    const directParse = new Date(value);
    if (!Number.isNaN(directParse.getTime())) {
      return directParse;
    }

    const normalizedParse = new Date(Date.parse(value.replace(/-/g, ' ')));
    return Number.isNaN(normalizedParse.getTime()) ? fallback : normalizedParse;
  }

  private translateInterpolateParams(
    params?: Record<string, unknown>
  ): Record<string, unknown> {
    if (!params) {
      return {};
    }

    return Object.keys(params).reduce(
      (acc, key) => {
        const value = params[key];
        acc[key] =
          typeof value === 'string'
            ? this.languageService.translate.instant(value)
            : value;
        return acc;
      },
      {} as Record<string, unknown>
    );
  }

  remove(id: number) {
    this.toastService.remove(id);
  }

  removeAllAreNotError() {
    for (const mess of this.messages$.value) {
      if (mess.options?.id && mess.type !== MessageType.ERROR) {
        this.remove(mess.options.id);
      }
    }
  }

  private handleTemplate(message: Message): Message {
    if (!this.options?.template || message.html) {
      return message;
    }

    let html = this.options?.template;
    html = html.replace('${text}', message.text);
    if (message.title) {
      html = html.replace('${title}', message.title);
    }

    message.html = undefined;
    message.text = html;
    message.title = undefined;
    return message;
  }
}
