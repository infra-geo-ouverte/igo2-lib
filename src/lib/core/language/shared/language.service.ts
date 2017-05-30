import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { TranslateService, TranslateLoader } from '@ngx-translate/core';

import { LanguageLoader } from './language.loader';


export function defaultLanguageLoader(http: Http) {
  return new LanguageLoader();
}

export function provideLanguageLoader(loader?) {

  return {
    provide: TranslateLoader,
    useFactory: (loader) || (defaultLanguageLoader),
    deps: [Http]
  };
}


@Injectable()
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
