import { HttpClient } from '@angular/common/http';
import { Injector, Provider } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { StorageService } from '@igo2/core/storage';

import {
  IChercheReverseSearchSource,
  IChercheSearchResultFormatter,
  IChercheSearchSource
} from './icherche';
import { SearchSource } from './source';
import { SearchSourceFeature, SearchSourceKind } from './source.interfaces';

/**
 * ICherche search result formatter factory
 * @ignore
 */
export function defaultIChercheSearchResultFormatterFactory(
  languageService: LanguageService
) {
  return new IChercheSearchResultFormatter(languageService);
}

/**
 * Function that returns a provider for the ICherche search result formatter
 */
export function provideDefaultIChercheSearchResultFormatter(): Provider {
  return {
    provide: IChercheSearchResultFormatter,
    useFactory: defaultIChercheSearchResultFormatterFactory,
    deps: [LanguageService]
  };
}

/**
 * ICherche search source factory
 * @ignore
 */
export function ichercheSearchSourceFactory(
  http: HttpClient,
  languageService: LanguageService,
  storageService: StorageService,
  config: ConfigService,
  formatter: IChercheSearchResultFormatter,
  injector: Injector
) {
  return new IChercheSearchSource(
    http,
    languageService,
    storageService,
    config.getConfig(`searchSources.${IChercheSearchSource.id}`),
    formatter,
    injector
  );
}

/**
 * Function that returns a provider for the ICherche search source
 */
export function provideIChercheSearchSource(): Provider {
  return {
    provide: SearchSource,
    useFactory: ichercheSearchSourceFactory,
    multi: true,
    deps: [
      HttpClient,
      LanguageService,
      StorageService,
      ConfigService,
      IChercheSearchResultFormatter,
      Injector
    ]
  };
}

export function withIChercheSource(): SearchSourceFeature<SearchSourceKind.ICherche> {
  return {
    kind: SearchSourceKind.ICherche,
    providers: [
      provideIChercheSearchSource(),
      provideDefaultIChercheSearchResultFormatter()
    ]
  };
}

/**
 * IChercheReverse search source factory
 * @ignore
 */
export function ichercheReverseSearchSourceFactory(
  http: HttpClient,
  languageService: LanguageService,
  storageService: StorageService,
  config: ConfigService,
  injector: Injector
) {
  return new IChercheReverseSearchSource(
    http,
    languageService,
    storageService,
    config.getConfig(`searchSources.${IChercheReverseSearchSource.id}`),
    injector
  );
}

/**
 * Function that returns a provider for the IChercheReverse search source
 */
export function provideIChercheReverseSearchSource() {
  return {
    provide: SearchSource,
    useFactory: ichercheReverseSearchSourceFactory,
    multi: true,
    deps: [HttpClient, LanguageService, StorageService, ConfigService, Injector]
  };
}

export function withIChercheReverseSource(): SearchSourceFeature<SearchSourceKind.IChercheReverse> {
  return {
    kind: SearchSourceKind.IChercheReverse,
    providers: [
      provideIChercheReverseSearchSource(),
      provideDefaultIChercheSearchResultFormatter()
    ]
  };
}
