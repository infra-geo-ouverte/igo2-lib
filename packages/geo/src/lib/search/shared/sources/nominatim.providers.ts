import { NominatimSearchSource } from './nominatim';
import { SearchSource } from './source';
import { SearchSourceFeature, SearchSourceKind } from './source.interfaces';

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

export function withNominatimSource(): SearchSourceFeature<SearchSourceKind.Nominatim> {
  return {
    kind: SearchSourceKind.Nominatim,
    providers: [provideNominatimSearchSource()]
  };
}
