import { ConfigService } from '@igo2/core/config';

import { SearchSource } from '../../search/shared/sources/source';
import { QuerySearchSource } from './query-search-source';

/**
 * Map search source factory
 * @ignore
 */
export function querySearchSourceFactory(config: ConfigService) {
  return new QuerySearchSource(
    config.getConfig(`searchSources.${QuerySearchSource.id}`) || {}
  );
}

/**
 * Function that returns a provider for the map search source
 */
export function provideQuerySearchSource() {
  return {
    provide: SearchSource,
    useFactory: querySearchSourceFactory,
    multi: true,
    deps: [ConfigService]
  };
}
