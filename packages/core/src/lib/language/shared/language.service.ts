import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private language: string = this.translate.getBrowserLang();

  constructor(public translate: TranslateService) {
    const lang = this.getLanguage();
    this.translate.setDefaultLang(lang);
  }

  public getLanguage(): string {
    return this.language.match(/en|fr/) ? this.language : 'en';
  }

  public setLanguage(language: string) {
    this.language = language.match(/en|fr/) ? language : 'en';
    this.translate.use(this.language);
    this.translate.reloadLang(this.language);
  }
}
