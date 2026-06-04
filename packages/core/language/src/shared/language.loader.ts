import { isPlatformServer } from '@angular/common';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { DOCUMENT, PLATFORM_ID, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { ObjectUtils } from '@igo2/utils';

import {
  BehaviorSubject,
  Observable,
  catchError,
  first,
  forkJoin,
  map,
  of,
  switchMap,
  tap
} from 'rxjs';

import { LanguagePackagesService } from './language-packages.service';
import {
  LanguageLoaderBase,
  LanguageOptions,
  TranslationObject
} from './language.interface';

export class LanguageLoader implements LanguageLoaderBase {
  private httpClient: HttpClient;

  private _isLoaded$ = new BehaviorSubject(false);
  isLoaded$ = this._isLoaded$.asObservable();

  suffix = '.json';
  prefix?: string[];
  options: LanguageOptions;

  baseUrl: string;
  private readonly languagePackagesService = inject(LanguagePackagesService);

  constructor(handler: HttpBackend, options: LanguageOptions) {
    this.httpClient = new HttpClient(handler);
    this.options = options;

    const document = inject(DOCUMENT);
    const platformId = inject(PLATFORM_ID);
    this.baseUrl = isPlatformServer(platformId)
      ? this.getServerUrl(document)
      : '';
  }

  private getServerUrl(document: Document): string {
    const origin = document.location.origin;
    return origin.endsWith('/') ? origin : origin + '/';
  }

  public getTranslation(lang: string): Observable<TranslationObject> {
    if (!this.prefix) {
      const prefix = this.options.appPrefix ?? this.options.prefix;
      this.prefix = !prefix ? [] : Array.isArray(prefix) ? prefix : [prefix];
    }

    const packageLocaleRequests = this.getPackageLocaleRequests(lang);
    const appLocale$ = this.prefix.map((prefix) =>
      this.httpClient.get<Record<string, unknown>>(
        `${this.baseUrl}${prefix}${lang}${this.suffix}`
      )
    );

    const locale$ = [...packageLocaleRequests, ...appLocale$];

    if (locale$.length === 0) {
      this._isLoaded$.next(true);
      return of({});
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

  private getPackageLocaleRequests(
    lang: string
  ): Observable<Record<string, unknown>>[] {
    const packages = this.resolvePackages();
    const packageBasePath = this.options.packageBasePath ?? 'igo2';

    return packages.map((packageName) => {
      const packageLocaleUrl = `${this.baseUrl}${packageBasePath}/${packageName}/locale/${lang}.${packageName}${this.suffix}`;
      return this.httpClient
        .get<Record<string, unknown>>(packageLocaleUrl)
        .pipe(catchError(() => of({})));
    });
  }

  private resolvePackages(): string[] {
    const configuredPackages = this.options.packages ?? [];
    const runtimePackages = this.languagePackagesService.getAll();

    return Array.from(new Set([...configuredPackages, ...runtimePackages]));
  }
}

export class LanguageLoaderWithAsyncConfig extends LanguageLoader {
  constructor(
    handler: HttpBackend,
    private configService: ConfigService,
    prefix?: string | string[],
    suffix = '.json'
  ) {
    super(handler, {});
    this.prefix = !prefix ? [] : Array.isArray(prefix) ? prefix : [prefix];
    this.suffix = suffix;
  }

  public getTranslation(lang: string): Observable<TranslationObject> {
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
