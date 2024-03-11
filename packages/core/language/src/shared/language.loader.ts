import { HttpBackend, HttpClient } from '@angular/common/http';

import { ConfigService } from '@igo2/core/config';
import { ObjectUtils } from '@igo2/utils';

import { BehaviorSubject, first, forkJoin, map, switchMap, tap } from 'rxjs';

import { LanguageLoaderBase } from './language.interface';

export class LanguageLoader implements LanguageLoaderBase {
  private httpClient: HttpClient;

  private _isLoaded$ = new BehaviorSubject<boolean>(null);
  isLoaded$ = this._isLoaded$.asObservable();

  constructor(
    handler: HttpBackend,
    private configService: ConfigService,
    private prefix?: string | string[],
    private suffix: string = '.json'
  ) {
    this.httpClient = new HttpClient(handler);
  }

  public getTranslation(lang: string): any {
    const igoLocale$ = this.httpClient.get(`locale/libs_locale/${lang}.json`);
    return this.configService.isLoaded$.pipe(
      first((isLoaded) => isLoaded),
      switchMap(() => {
        if (this.configService && !this.prefix) {
          const prefix = this.configService.getConfig('language.prefix');
          this.prefix = !prefix || Array.isArray(prefix) ? prefix : [prefix];
        }

        if (!this.prefix || this.prefix.length === 0) {
          this._isLoaded$.next(true);
          return igoLocale$;
        }

        const appLocale$ = (this.prefix as string[]).map((prefix) =>
          this.httpClient.get(`${prefix}${lang}${this.suffix}`)
        );

        const locale$ = forkJoin([igoLocale$, ...appLocale$]);

        return locale$.pipe(
          map((translations) => {
            return translations.reduce(
              (acc, current) => ObjectUtils.mergeDeep(acc, current),
              {}
            );
          }),
          tap(() => {
            this._isLoaded$.next(true);
          })
        );
      })
    );
  }
}
