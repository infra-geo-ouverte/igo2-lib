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
export function storedqueriesSearchSourceFactory() {
  return new StoredQueriesSearchSource();
}

/**
 * Function that returns a provider for the StoredQueries search source
 * @deprecated This provider is deprecated and will be removed in a future major version, likely in 23.x+.
 */
export function provideStoredQueriesSearchSource() {
  return {
    provide: SearchSource,
    useFactory: storedqueriesSearchSourceFactory,
    multi: true
  };
}

/**
 * @deprecated This search source is deprecated and will be removed in a future major version, likely in 23.x+.
 */
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

export function storedqueriesReverseSearchSourceFactory() {
  return new StoredQueriesReverseSearchSource();
}

/**
 * Function that returns a provider for the StoredQueriesReverse search source
 * @deprecated This provider is deprecated and will be removed in a future major version, likely in 23.x+.
 */
export function provideStoredQueriesReverseSearchSource() {
  return {
    provide: SearchSource,
    useFactory: storedqueriesReverseSearchSourceFactory,
    multi: true
  };
}

/**
 * @deprecated This search source is deprecated and will be removed in a future major version, likely in 23.x+.
 */
export function withStoredQueriesReverseSource(): SearchSourceFeature<SearchSourceKind.StoredQueriesReverse> {
  return {
    kind: SearchSourceKind.StoredQueriesReverse,
    providers: [provideStoredQueriesReverseSearchSource()]
  };
}
