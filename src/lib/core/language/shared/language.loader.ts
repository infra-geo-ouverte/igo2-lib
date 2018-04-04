import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/operators/combineLatest';

import { TranslateLoader } from '@ngx-translate/core';

import { ConfigService } from '../../config';

declare function require(arg: string): any;

export class LanguageLoader implements TranslateLoader {
  constructor(private http: HttpClient,
              private prefix?: string,
              private suffix: string = '.json',
              private config?: ConfigService) {}

  public getTranslation(lang: string): any {
    const translation = require(`../../../../../src/locale/${lang}.json`);
    const igoLocale$ = Observable.of(translation);

    if (this.config && !this.prefix) {
      this.prefix = this.config.getConfig('language.prefix');
    }

    if (!this.prefix) {
        return igoLocale$;
    }

    const appLocale$ = this.http.get(`${this.prefix}${lang}${this.suffix}`);

    return igoLocale$.pipe(
      combineLatest(appLocale$, (igoTranslation, appTranslation) => {
        return Object.assign(igoTranslation, appTranslation);
      })
    );

  }
}
