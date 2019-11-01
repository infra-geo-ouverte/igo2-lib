import { HttpClient } from '@angular/common/http';

import { of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { TranslateLoader } from '@ngx-translate/core';

import { ObjectUtils } from '@igo2/utils';

import { ConfigService } from '../../config/config.service';

declare function require(arg: string): any;

export class LanguageLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    private prefix?: string,
    private suffix: string = '.json',
    private config?: ConfigService
  ) {}

  public getTranslation(lang: string): any {
    const translation = require(`../locale/${lang}.json`);
    const igoLocale$ = of(translation);

    if (this.config && !this.prefix) {
      this.prefix = this.config.getConfig('language.prefix');
    }

    if (!this.prefix) {
      return igoLocale$;
    }

    const appLocale$ = this.http.get(`${this.prefix}${lang}${this.suffix}`);

    const locale$ = combineLatest(igoLocale$, appLocale$);

    return locale$.pipe(
      map(translations => {
        return ObjectUtils.mergeDeep(translations[0], translations[1]);
      })
    );
  }
}
