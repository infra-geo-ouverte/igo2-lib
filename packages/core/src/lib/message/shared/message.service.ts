import { Injectable, Inject, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, forkJoin } from 'rxjs';

import { ConfigService } from '../../config/config.service';

import { Message, MessageOptions } from './message.interface';
import { ActiveToast, IndividualConfig, ToastrService } from 'ngx-toastr';
import { MessageType } from './message.enum';
import { LanguageService } from '../../language/shared/language.service';
import { debounceTime, first } from 'rxjs/operators';

interface ActiveMessageTranslation {
  id: number;
  titleKey: string;
  messageKey: string;
}
@Injectable({
  providedIn: 'root'
})
export class MessageService {
  public messages$ = new BehaviorSubject<Message[]>([]);
  private options: MessageOptions;
  private activeMessageTranslations: ActiveMessageTranslation[]

  constructor(
    @Inject(Injector) private injector: Injector,
    private configService: ConfigService,
    private languageService: LanguageService
  ) {
    this.options = this.configService.getConfig('message') || {};
    this.languageService.language$.pipe(debounceTime(500)).subscribe(r => {
      if (this.toastr.toasts.length === 0) {
        this.activeMessageTranslations = [];
      }
      this.toastr.toasts.map(toast => {
        const activeMessageTranslation = this.activeMessageTranslations.find(amt => amt.id === toast.toastId);
        if (activeMessageTranslation) {
          forkJoin([
          this.languageService.translate.get(activeMessageTranslation.messageKey),
          this.languageService.translate.get(activeMessageTranslation.titleKey)
        ]).pipe(first()).subscribe((res: [string, string]) => {
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
    this.messages$.next(this.messages$.value.concat([message]));

    message.options = message.options || {} as MessageOptions;
    const currentDate = new Date();

    message.options.from = message.options.from ? message.options.from : new Date('1 jan 1900');
    message.options.to = message.options.to ? message.options.to : new Date('1 jan 3000');
    if (typeof message.options.from === 'string') {
      message.options.from = new Date(Date.parse(message.options.from.replace(/-/g, ' ')));
    }
    if (typeof message.options.to === 'string') {
      message.options.to = new Date(Date.parse(message.options.to.replace(/-/g, ' ')));
    }
    if (
      currentDate > message.options.from && currentDate < message.options.to) {

      message = this.handleTemplate(message);

      if (message.text) {
        let messageShown: ActiveToast<any>;
        switch (message.type) {
          case MessageType.SUCCESS:
            messageShown = this.success(message.text, message.title, message.options);
            break;
          case MessageType.ERROR:
            messageShown = this.error(message.text, message.title, message.options);
            break;
          case MessageType.INFO:
            messageShown = this.info(message.text, message.title, message.options);
            break;
          case MessageType.ALERT:
          case MessageType.WARNING:
            messageShown = this.alert(message.text, message.title, message.options);
            break;
          default:
            messageShown = this.info(message.text, message.title, message.options);
            break;
        }
        message.options.id = messageShown.toastId;
      }
    }
  }

  success(text: string, title: string = 'igo.core.message.success', options: Partial<IndividualConfig> = {}): ActiveToast<any> {
    const message = this.languageService.translate.instant(text);
    const translatedTitle = this.languageService.translate.instant(title);
    const activeToast = this.toastr.success(message, translatedTitle, options);
    this.activeMessageTranslations.push({id: activeToast.toastId, titleKey: title, messageKey: text});
    return activeToast;
  }

  error(text: string, title: string = 'igo.core.message.error', options: Partial<IndividualConfig> = {}): ActiveToast<any> {
    const message = this.languageService.translate.instant(text);
    const translatedTitle = this.languageService.translate.instant(title);
    const activeToast = this.toastr.error(message, translatedTitle, options);
    this.activeMessageTranslations.push({id: activeToast.toastId, titleKey: title, messageKey: text});
    return activeToast;
  }

  info(text: string, title: string = 'igo.core.message.info', options: Partial<IndividualConfig> = {}): ActiveToast<any> {
    const message = this.languageService.translate.instant(text);
    const translatedTitle = this.languageService.translate.instant(title);
    const activeToast = this.toastr.info(message, translatedTitle, options);
    this.activeMessageTranslations.push({id: activeToast.toastId, titleKey: title, messageKey: text});
    return activeToast;
  }

  alert(text: string, title: string = 'igo.core.message.alert', options: Partial<IndividualConfig> = {}): ActiveToast<any> {
    const message = this.languageService.translate.instant(text);
    const translatedTitle = this.languageService.translate.instant(title);
    const activeToast = this.toastr.warning(message, translatedTitle, options);
    this.activeMessageTranslations.push({id: activeToast.toastId, titleKey: title, messageKey: text});
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
    if (!this.options.template || message.html) {
      return message;
    }

    let html = this.options.template;
    html = html.replace('${text}', message.text);
    html = html.replace('${title}', message.title);

    message.html = undefined;
    message.text = html;
    message.title = undefined;
    return message;
  }
}
