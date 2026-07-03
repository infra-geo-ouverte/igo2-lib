import {
  NOMINATIM_SEARCH_SOURCE_OPTIONS,
  NominatimSearchSource
} from './nominatim';
import { SearchSource } from './source';
import {
  SearchSourceFeature,
  SearchSourceKind,
  SearchSourceOptions
} from './source.interfaces';

/**
 * Nominatim search source factory
 * @ignore
 */
export function nominatimSearchSourceFactory() {
  return new NominatimSearchSource();
}

/**
 * Function that returns a provider for the Nominatim search source
 */
export function provideNominatimSearchSource() {
  return {
    provide: SearchSource,
    useFactory: nominatimSearchSourceFactory,
    multi: true
  };
}

export function withNominatimSource(
  options?: SearchSourceOptions
): SearchSourceFeature<SearchSourceKind.Nominatim> {
  return {
    kind: SearchSourceKind.Nominatim,
    providers: [
      provideNominatimSearchSource(),
      ...(options
        ? [{ provide: NOMINATIM_SEARCH_SOURCE_OPTIONS, useValue: options }]
        : [])
    ]
  };
}
