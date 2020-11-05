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
    private prefix?: string | string[],
    private suffix: string = '.json',
    private config?: ConfigService
  ) {}

  public getTranslation(lang: string): any {
    const translation = require(`../locale/${lang}.json`);
    const igoLocale$ = of(translation);

    if (this.config && !this.prefix) {
      const prefix = this.config.getConfig('language.prefix');
      this.prefix = !prefix || Array.isArray(prefix) ? prefix : [prefix];
    }

    if (!this.prefix || this.prefix.length === 0) {
      return igoLocale$;
    }

    const appLocale$ = (this.prefix as string[]).map((prefix) =>
      this.http.get(`${prefix}${lang}${this.suffix}`)
    );

    const locale$ = combineLatest([igoLocale$, ...appLocale$]);

    return locale$.pipe(
      map((translations) => {
        return translations.reduce(
          (acc, current) => ObjectUtils.mergeDeep(acc, current),
          []
        );
      })
    );
  }
}
