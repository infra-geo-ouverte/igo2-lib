import { HttpClient } from '@angular/common/http';

import { ConfigService, LanguageService } from '@igo2/core';

import { SearchSource } from './source';
import {
  StoredQueriesSearchSource,
  StoredQueriesReverseSearchSource
} from './storedqueries';

/**
 * StoredQueries search source factory
 * @ignore
 */
export function storedqueriesSearchSourceFactory(
  http: HttpClient,
  languageService: LanguageService,
  config: ConfigService
) {
  return new StoredQueriesSearchSource(
    http,
    languageService,
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
    deps: [HttpClient, LanguageService, ConfigService]
  };
}

/**
 * StoredQueriesReverse search source factory
 * @ignore
 */

export function storedqueriesReverseSearchSourceFactory(
  http: HttpClient,
  languageService: LanguageService,
  config: ConfigService
) {
  return new StoredQueriesReverseSearchSource(
    http,
    languageService,
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
    deps: [HttpClient, LanguageService, ConfigService]
  };
}
