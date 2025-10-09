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
 */
export function provideStoredQueriesSearchSource() {
  return {
    provide: SearchSource,
    useFactory: storedqueriesSearchSourceFactory,
    multi: true
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

export function storedqueriesReverseSearchSourceFactory() {
  return new StoredQueriesReverseSearchSource();
}

/**
 * Function that returns a provider for the StoredQueriesReverse search source
 */
export function provideStoredQueriesReverseSearchSource() {
  return {
    provide: SearchSource,
    useFactory: storedqueriesReverseSearchSourceFactory,
    multi: true
  };
}

export function withStoredQueriesReverseSource(): SearchSourceFeature<SearchSourceKind.StoredQueriesReverse> {
  return {
    kind: SearchSourceKind.StoredQueriesReverse,
    providers: [provideStoredQueriesReverseSearchSource()]
  };
}
