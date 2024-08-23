import { HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';

import { ActiveToast, IndividualConfig, ToastrService } from 'ngx-toastr';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { debounceTime, first } from 'rxjs/operators';

import { MessageType } from './message.enum';
import { Message, MessageOptions } from './message.interface';

interface ActiveMessageTranslation {
  id: number;
  titleKey: string;
  textKey: string;
  textInterpolateParams?: object;
  titleInterpolateParams?: object;
}
@Injectable({
  providedIn: 'root'
})
export class MessageService {
  public messages$ = new BehaviorSubject<Message[]>([]);
  private options?: MessageOptions;
  private activeMessageTranslations: ActiveMessageTranslation[] = [];

  constructor(
    @Inject(Injector) private injector: Injector,
    private configService: ConfigService,
    private languageService: LanguageService
  ) {
    this.options = this.configService.getConfig('message');
    this.languageService.language$.pipe(debounceTime(500)).subscribe((r) => {
      if (this.toastr.toasts.length === 0) {
        this.activeMessageTranslations = [];
      }
      this.toastr.toasts.map((toast) => {
        const activeMessageTranslation = this.activeMessageTranslations.find(
          (amt) => amt.id === toast.toastId
        );
        if (activeMessageTranslation) {
          const translatedTextInterpolateParams = {
            ...activeMessageTranslation.textInterpolateParams
          };
          const translatedTitleInterpolateParams = {
            ...activeMessageTranslation.titleInterpolateParams
          };

          if (activeMessageTranslation.textInterpolateParams) {
            Object.keys(activeMessageTranslation.textInterpolateParams).map(
              (k) => {
                if (k) {
                  translatedTextInterpolateParams[k] =
                    this.languageService.translate.instant(
                      activeMessageTranslation.textInterpolateParams[k]
                    );
                }
              }
            );
          }
          if (activeMessageTranslation.titleInterpolateParams) {
            Object.keys(activeMessageTranslation.titleInterpolateParams).map(
              (k) => {
                if (k) {
                  translatedTitleInterpolateParams[k] =
                    this.languageService.translate.instant(
                      activeMessageTranslation.titleInterpolateParams[k]
                    );
                }
              }
            );
          }

          forkJoin([
            this.languageService.translate.get(
              activeMessageTranslation.textKey,
              translatedTextInterpolateParams
            ),
            this.languageService.translate.get(
              activeMessageTranslation.titleKey,
              translatedTitleInterpolateParams
            )
          ])
            .pipe(first())
            .subscribe((res: [string, string]) => {
              toast.toastRef.componentInstance.message = res[0];
              toast.toastRef.componentInstance.title = res[1];
            });
        }
      });
    });
  }

  private get toastr(): ToastrService {
    return this.injector.get(ToastrService);
  }

  showError(httpError: HttpErrorResponse) {
    httpError.error.caught = true;
    return this.error(httpError.error.message, httpError.error.title);
  }

  message(message: Message) {
    const messageType = message.type;
    this.toastr.toastrConfig.iconClasses[messageType] = `toast-${messageType}`;

    this.messages$.next(this.messages$.value.concat([message]));

    message.options = message.options || ({} as MessageOptions);
    const currentDate = new Date();

    message.options.from = message.options.from
      ? message.options.from
      : new Date('1 jan 1900');
    message.options.to = message.options.to
      ? message.options.to
      : new Date('1 jan 3000');
    if (typeof message.options.from === 'string') {
      message.options.from = new Date(
        Date.parse(message.options.from.replace(/-/g, ' '))
      );
    }
    if (typeof message.options.to === 'string') {
      message.options.to = new Date(
        Date.parse(message.options.to.replace(/-/g, ' '))
      );
    }
    if (
      currentDate > message.options.from &&
      currentDate < message.options.to
    ) {
      if (message.showIcon === false) {
        this.toastr.toastrConfig.iconClasses[messageType] =
          `toast-${messageType} toast-no-icon`;
      }
      message = this.handleTemplate(message);

      if (message.text) {
        let messageShown: ActiveToast<any>;
        switch (message.type) {
          case MessageType.SUCCESS:
            messageShown = this.success(
              message.text,
              message.title,
              message.options,
              message.textInterpolateParams,
              message.titleInterpolateParams
            );
            break;
          case MessageType.ERROR:
            messageShown = this.error(
              message.text,
              message.title,
              message.options,
              message.textInterpolateParams,
              message.titleInterpolateParams
            );
            break;
          case MessageType.INFO:
            messageShown = this.info(
              message.text,
              message.title,
              message.options,
              message.textInterpolateParams,
              message.titleInterpolateParams
            );
            break;
          case MessageType.SHOW:
            messageShown = this.show(
              message.text,
              message.title,
              message.options,
              message.textInterpolateParams,
              message.titleInterpolateParams
            );
            break;
          case MessageType.ALERT:
          case MessageType.WARNING:
            messageShown = this.alert(
              message.text,
              message.title,
              message.options,
              message.textInterpolateParams,
              message.titleInterpolateParams
            );
            break;
          default:
            messageShown = this.info(
              message.text,
              message.title,
              message.options,
              message.textInterpolateParams,
              message.titleInterpolateParams
            );
            break;
        }
        message.options.id = messageShown.toastId;
      }
    }
  }

  success(
    text: string,
    title = 'igo.core.message.success',
    options: Partial<IndividualConfig> = {},
    textInterpolateParams?: object,
    titleInterpolateParams?: object
  ): ActiveToast<any> {
    return this.handleNgxToastr(
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
    options: Partial<IndividualConfig> = {},
    textInterpolateParams?: object,
    titleInterpolateParams?: object
  ): ActiveToast<any> {
    return this.handleNgxToastr(
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
    options: Partial<IndividualConfig> = {},
    textInterpolateParams?: object,
    titleInterpolateParams?: object
  ): ActiveToast<any> {
    return this.handleNgxToastr(
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
    options: Partial<IndividualConfig> = {},
    textInterpolateParams?: object,
    titleInterpolateParams?: object
  ): ActiveToast<any> {
    return this.handleNgxToastr(
      'alert',
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
    options: Partial<IndividualConfig> = {},
    textInterpolateParams?: object,
    titleInterpolateParams?: object
  ): ActiveToast<any> {
    return this.handleNgxToastr(
      'show',
      text,
      title,
      options,
      textInterpolateParams,
      titleInterpolateParams
    );
  }

  private handleNgxToastr(
    type: 'alert' | 'info' | 'error' | 'success' | 'show',
    text: string,
    title: string,
    options: Partial<IndividualConfig> = {},
    textInterpolateParams?: object,
    titleInterpolateParams?: object
  ): ActiveToast<any> {
    const translatedTextInterpolateParams = { ...textInterpolateParams };
    const translatedTitlenterpolateParams = { ...titleInterpolateParams };

    if (textInterpolateParams) {
      Object.keys(textInterpolateParams).map((k) => {
        const value = textInterpolateParams[k];
        if (value) {
          translatedTextInterpolateParams[k] =
            typeof value === 'string'
              ? this.languageService.translate.instant(value)
              : value;
        }
      });
    }
    if (titleInterpolateParams) {
      Object.keys(titleInterpolateParams).map((k) => {
        if (k) {
          const value = titleInterpolateParams[k];
          translatedTitlenterpolateParams[k] =
            typeof value === 'string'
              ? this.languageService.translate.instant(value)
              : value;
        }
      });
    }

    const message = this.languageService.translate.instant(
      text,
      translatedTextInterpolateParams
    );
    const translatedTitle = this.languageService.translate.instant(
      title,
      translatedTitlenterpolateParams
    );

    let activeToast;
    switch (type) {
      case 'success':
        activeToast = this.toastr.success(message, translatedTitle, options);
        break;
      case 'error':
        activeToast = this.toastr.error(message, translatedTitle, options);
        break;
      case 'show':
      case 'info':
        activeToast = this.toastr.info(message, translatedTitle, options);
        break;
      case 'alert':
        activeToast = this.toastr.warning(message, translatedTitle, options);
        break;
    }
    this.activeMessageTranslations.push({
      id: activeToast.toastId,
      titleKey: title,
      textKey: text,
      textInterpolateParams,
      titleInterpolateParams
    });
    return activeToast;
  }

  remove(id?: number) {
    this.toastr.remove(id);
  }

  removeAllAreNotError() {
    for (const mess of this.messages$.value) {
      if (mess.type !== MessageType.ERROR) {
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
    html = html.replace('${title}', message.title);

    message.html = undefined;
    message.text = html;
    message.title = undefined;
    return message;
  }
}
