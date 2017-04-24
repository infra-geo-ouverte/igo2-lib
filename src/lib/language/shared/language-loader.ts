import { Http, Response } from '@angular/http';
import {Observable} from 'rxjs/Observable';

import { TranslateLoader } from '@ngx-translate/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/combineLatest';

declare function require(arg: string): any;

export class LanguageLoader implements TranslateLoader {
    constructor(private http?: Http,
                private prefix: string = '/assets/locale/',
                private suffix: string = '.json') {}

    public getTranslation(lang: string): any {
      const translation = require(`../../../assets/locale/${lang}.json`);
      const igoLocale$ = Observable.of(translation);

      if (!this.http) {
        return igoLocale$;
      }

      const appLocale$ = this.http.get(`${this.prefix}${lang}${this.suffix}`)
          .map((res: Response) => res.json());

      return igoLocale$.combineLatest(appLocale$, (igoTranslation, appTranslation) => {
        return Object.assign(igoTranslation, appTranslation);
      });

    }
}
