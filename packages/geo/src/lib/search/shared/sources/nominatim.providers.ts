import { HttpClient } from '@angular/common/http';

import { ConfigService } from '@igo2/core/config';
import { StorageService } from '@igo2/core/storage';

import { NominatimSearchSource } from './nominatim';
import { SearchSource } from './source';
import { SearchSourceFeature, SearchSourceKind } from './source.interfaces';

/**
 * Nominatim search source factory
 * @ignore
 */
export function nominatimSearchSourceFactory(
  http: HttpClient,
  config: ConfigService,
  storageService: StorageService
) {
  return new NominatimSearchSource(
    http,
    config.getConfig(`searchSources.${NominatimSearchSource.id}`),
    storageService
  );
}

/**
 * Function that returns a provider for the Nominatim search source
 */
export function provideNominatimSearchSource() {
  return {
    provide: SearchSource,
    useFactory: nominatimSearchSourceFactory,
    multi: true,
    deps: [HttpClient, ConfigService, StorageService]
  };
}

export function withNominatimSource(): SearchSourceFeature<SearchSourceKind.Nominatim> {
  return {
    kind: SearchSourceKind.Nominatim,
    providers: [provideNominatimSearchSource()]
  };
}
