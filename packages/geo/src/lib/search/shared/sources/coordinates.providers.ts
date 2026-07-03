import { Projection } from '../../../map/shared/projection.interfaces';
import {
  COORDINATES_REVERSE_SEARCH_SOURCE_OPTIONS,
  COORDINATES_REVERSE_SEARCH_SOURCE_PROJECTIONS,
  CoordinatesReverseSearchSource,
  CoordinatesSearchResultFormatter
} from './coordinates';
import { SearchSource } from './source';
import {
  SearchSourceFeature,
  SearchSourceKind,
  SearchSourceOptions
} from './source.interfaces';

/**
 * Coordinate search result formatter factory
 * @ignore
 */
export function defaultCoordinatesSearchResultFormatterFactory() {
  return new CoordinatesSearchResultFormatter();
}

/**
 * Function that returns a provider for the Coordinates search result formatter
 */
export function provideDefaultCoordinatesSearchResultFormatter() {
  return {
    provide: CoordinatesSearchResultFormatter,
    useFactory: defaultCoordinatesSearchResultFormatterFactory
  };
}

/**
 * CoordinatesReverse search source factory
 * @ignore
 */
export function CoordinatesReverseSearchSourceFactory() {
  return new CoordinatesReverseSearchSource();
}

/**
 * Function that returns a provider for the Coordinate search source
 */
export function provideCoordinatesReverseSearchSource() {
  return {
    provide: SearchSource,
    useFactory: CoordinatesReverseSearchSourceFactory,
    multi: true
  };
}

export function withCoordinatesReverseSource(config?: {
  options?: SearchSourceOptions;
  projections?: Projection[];
}): SearchSourceFeature<SearchSourceKind.CoordinatesReverse> {
  return {
    kind: SearchSourceKind.CoordinatesReverse,
    providers: [
      provideCoordinatesReverseSearchSource(),
      provideDefaultCoordinatesSearchResultFormatter(),
      ...(config?.options
        ? [
            {
              provide: COORDINATES_REVERSE_SEARCH_SOURCE_OPTIONS,
              useValue: config.options
            }
          ]
        : []),
      ...(config?.projections
        ? [
            {
              provide: COORDINATES_REVERSE_SEARCH_SOURCE_PROJECTIONS,
              useValue: config.projections
            }
          ]
        : [])
    ]
  };
}
