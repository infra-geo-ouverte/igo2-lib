import { Injectable, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class LanguageService {

  constructor(private translate: TranslateService, private zone: NgZone) {
    const lang = this.getLanguage();
    this.translate.setDefaultLang(lang);
  }

  public getLanguage(): string {
    const browserLang = this.translate.getBrowserLang();
    return browserLang.match(/en|fr/) ? browserLang : 'en';
  }

  public setLanguage(language: string) {
    this.translate.use(language);
    this.translate.reloadLang(language);
    this.zone.run(() => {});
  }
}
