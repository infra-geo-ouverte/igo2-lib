import { Provider } from '@angular/core';

import {
  ICHERCHE_REVERSE_SEARCH_SOURCE_OPTIONS,
  ICHERCHE_SEARCH_SOURCE_OPTIONS,
  IChercheReverseSearchSource,
  IChercheSearchResultFormatter,
  IChercheSearchSource
} from './icherche';
import { SearchSource } from './source';
import {
  SearchSourceFeature,
  SearchSourceKind,
  SearchSourceOptions
} from './source.interfaces';

/**
 * ICherche search result formatter factory
 * @ignore
 */
export function defaultIChercheSearchResultFormatterFactory() {
  return new IChercheSearchResultFormatter();
}

/**
 * Function that returns a provider for the ICherche search result formatter
 */
export function provideDefaultIChercheSearchResultFormatter(): Provider {
  return {
    provide: IChercheSearchResultFormatter,
    useFactory: defaultIChercheSearchResultFormatterFactory
  };
}

/**
 * ICherche search source factory
 * @ignore
 */
export function ichercheSearchSourceFactory() {
  return new IChercheSearchSource();
}

/**
 * Function that returns a provider for the ICherche search source
 */
export function provideIChercheSearchSource(): Provider {
  return {
    provide: SearchSource,
    useFactory: ichercheSearchSourceFactory,
    multi: true
  };
}

export function withIChercheSource(
  options?: SearchSourceOptions
): SearchSourceFeature<SearchSourceKind.ICherche> {
  return {
    kind: SearchSourceKind.ICherche,
    providers: [
      provideIChercheSearchSource(),
      provideDefaultIChercheSearchResultFormatter(),
      ...(options
        ? [{ provide: ICHERCHE_SEARCH_SOURCE_OPTIONS, useValue: options }]
        : [])
    ]
  };
}

/**
 * IChercheReverse search source factory
 * @ignore
 */
export function ichercheReverseSearchSourceFactory() {
  return new IChercheReverseSearchSource();
}

/**
 * Function that returns a provider for the IChercheReverse search source
 */
export function provideIChercheReverseSearchSource() {
  return {
    provide: SearchSource,
    useFactory: ichercheReverseSearchSourceFactory,
    multi: true
  };
}

export function withIChercheReverseSource(
  options?: SearchSourceOptions
): SearchSourceFeature<SearchSourceKind.IChercheReverse> {
  return {
    kind: SearchSourceKind.IChercheReverse,
    providers: [
      provideIChercheReverseSearchSource(),
      provideDefaultIChercheSearchResultFormatter(),
      ...(options
        ? [
            {
              provide: ICHERCHE_REVERSE_SEARCH_SOURCE_OPTIONS,
              useValue: options
            }
          ]
        : [])
    ]
  };
}
