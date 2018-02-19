import { Injectable } from '@angular/core';
import { DownloadOptions } from '.';
import { MessageService, LanguageService } from '../../core';

@Injectable()
export class DownloadService {

  constructor(private messageService: MessageService,
    private languageService: LanguageService) { }

  open(download: DownloadOptions) {
    const translate = this.languageService.translate;
    const title = translate.instant('igo.download.title');
    this.messageService.success(translate.instant('igo.download.start'), title);
    window.location.assign(download.url);

  }

}
