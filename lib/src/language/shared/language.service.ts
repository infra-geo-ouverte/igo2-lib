import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { TranslateService } from '@ngx-translate/core';

declare function require(arg: string): any;

@Injectable()
export class LanguageService {

  constructor(private translate: TranslateService,
              private http: Http) {
    const lang = this.getLanguage();

    const translation = require(`../../../assets/locale/${lang}.json`);
    this.translate.setTranslation(lang, translation, true);
    // this.readTranslation('/lib/assets/locale/', lang);

    this.translate.setDefaultLang('en');
    this.translate.use(lang);
  }

  public getLanguage(): string {
    const browserLang = this.translate.getBrowserLang();
    return browserLang.match(/en|fr/) ? browserLang : 'en';
  }

  public readTranslation(prefix: string, lang: string = this.getLanguage()): any {
    return this.http.get(`${prefix}${lang}.json`)
      .map((res: Response) => res.json())
      .subscribe((translation) => {
        this.translate.setTranslation(lang, translation, true);
      });
  }

  public setTranslation(lang: string, translation: Object): void {
    this.translate.setTranslation(lang, translation, true);
  }

}
