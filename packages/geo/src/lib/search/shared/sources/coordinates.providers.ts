import { HttpClient } from '@angular/common/http';

import { ConfigService, LanguageService } from '@igo2/core';

import { SearchSource } from './source';
import {
  CoordinatesReverseSearchSource,
  CoordinatesSearchResultFormatter
} from './coordinates';

/**
 * ICherche search result formatter factory
 * @ignore
 */
export function defaultCoordinatesSearchResultFormatterFactory(
  languageService: LanguageService
) {
  return new CoordinatesSearchResultFormatter(languageService);
}

/**
 * Function that returns a provider for the ICherche search result formatter
 */
export function provideDefaultCoordinatesSearchResultFormatter() {
  return {
    provide: CoordinatesSearchResultFormatter,
    useFactory: defaultCoordinatesSearchResultFormatterFactory,
    deps: [LanguageService]
  };
}

/**
 * CoordinatesReverse search source factory
 * @ignore
 */
export function CoordinatesReverseSearchSourceFactory(
  http: HttpClient,
  config: ConfigService
) {
  return new CoordinatesReverseSearchSource(
    http,
    config.getConfig(`searchSources.${CoordinatesReverseSearchSource.id}`)
  );
}

/**
 * Function that returns a provider for the IChercheReverse search source
 */
export function provideCoordinatesReverseSearchSource() {
  return {
    provide: SearchSource,
    useFactory: CoordinatesReverseSearchSourceFactory,
    multi: true,
    deps: [HttpClient, ConfigService]
  };
}
