import { HttpClient } from '@angular/common/http';

import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { StorageService } from '@igo2/core/storage';

import { SearchSource } from './source';
import { SearchSourceFeature, SearchSourceKind } from './source.interfaces';
import {
  StoredQueriesReverseSearchSource,
  StoredQueriesSearchSource
} from './storedqueries';

/**
 * StoredQueries search source factory
 * @ignore
 */
export function storedqueriesSearchSourceFactory(
  http: HttpClient,
  languageService: LanguageService,
  storageService: StorageService,
  config: ConfigService
) {
  return new StoredQueriesSearchSource(
    http,
    languageService,
    storageService,
    config.getConfig(`searchSources.${StoredQueriesSearchSource.id}`)
  );
}

/**
 * Function that returns a provider for the StoredQueries search source
 */
export function provideStoredQueriesSearchSource() {
  return {
    provide: SearchSource,
    useFactory: storedqueriesSearchSourceFactory,
    multi: true,
    deps: [HttpClient, LanguageService, StorageService, ConfigService]
  };
}

export function withStoredQueriesSource(): SearchSourceFeature<SearchSourceKind.StoredQueries> {
  return {
    kind: SearchSourceKind.StoredQueries,
    providers: [provideStoredQueriesSearchSource()]
  };
}

/**
 * StoredQueriesReverse search source factory
 * @ignore
 */

export function storedqueriesReverseSearchSourceFactory(
  http: HttpClient,
  languageService: LanguageService,
  storageService: StorageService,
  config: ConfigService
) {
  return new StoredQueriesReverseSearchSource(
    http,
    languageService,
    storageService,
    config.getConfig(`searchSources.${StoredQueriesReverseSearchSource.id}`)
  );
}

/**
 * Function that returns a provider for the StoredQueriesReverse search source
 */
export function provideStoredQueriesReverseSearchSource() {
  return {
    provide: SearchSource,
    useFactory: storedqueriesReverseSearchSourceFactory,
    multi: true,
    deps: [HttpClient, LanguageService, StorageService, ConfigService]
  };
}

export function withStoredQueriesReverseSource(): SearchSourceFeature<SearchSourceKind.StoredQueriesReverse> {
  return {
    kind: SearchSourceKind.StoredQueriesReverse,
    providers: [provideStoredQueriesReverseSearchSource()]
  };
}
