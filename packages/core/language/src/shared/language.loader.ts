import { HttpBackend, HttpClient } from '@angular/common/http';

import { ConfigService } from '@igo2/core/config';
import { ObjectUtils } from '@igo2/utils';

import {
  BehaviorSubject,
  Observable,
  first,
  forkJoin,
  map,
  of,
  switchMap,
  tap
} from 'rxjs';

import { LanguageLoaderBase, LanguageOptions } from './language.interface';

export class LanguageLoader implements LanguageLoaderBase {
  private httpClient: HttpClient;

  private _isLoaded$ = new BehaviorSubject<boolean>(null);
  isLoaded$ = this._isLoaded$.asObservable();

  suffix = '.json';
  prefix?: string | string[];
  options: LanguageOptions;

  constructor(handler: HttpBackend, options: LanguageOptions) {
    this.httpClient = new HttpClient(handler);
    this.options = options;
  }

  public getTranslation(lang: string): Observable<any> {
    const igoLocale$ = this.httpClient.get(`locale/libs_locale/${lang}.json`);
    if (!this.prefix) {
      const prefix = this.options.prefix;
      this.prefix = !prefix || Array.isArray(prefix) ? prefix : [prefix];
    }

    if (!this.prefix || this.prefix.length === 0) {
      this._isLoaded$.next(true);
      return this.options.ignoreLibsLocale ? of(undefined) : igoLocale$;
    }

    const appLocale$ = (this.prefix as string[]).map((prefix) =>
      this.httpClient.get(`${prefix}${lang}${this.suffix}`)
    );

    const locale$ = [...appLocale$];

    if (!this.options.ignoreLibsLocale) {
      locale$.unshift(igoLocale$);
    }

    return forkJoin(locale$).pipe(
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
  }
}

export class LanguageLoaderWithAsyncConfig extends LanguageLoader {
  constructor(
    handler: HttpBackend,
    private configService: ConfigService,
    prefix?: string | string[],
    suffix = '.json'
  ) {
    super(handler, undefined);
    this.prefix = prefix;
    this.suffix = suffix;
  }

  public getTranslation(lang: string): Observable<any> {
    return this.configService.isLoaded$.pipe(
      first((isLoaded) => isLoaded),
      switchMap(() => {
        this.options =
          this.configService.getConfig<LanguageOptions>('language');

        return super.getTranslation(lang);
      })
    );
  }
}
