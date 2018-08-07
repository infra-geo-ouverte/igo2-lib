import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  constructor(public translate: TranslateService) {
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
  }
}
