import { HttpClient } from '@angular/common/http';

import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { StorageService } from '@igo2/core/storage';

import { CadastreSearchSource } from './cadastre';
import { SearchSource } from './source';
import { SearchSourceFeature, SearchSourceKind } from './source.interfaces';

/**
 * Cadastre search source factory
 * @ignore
 */
export function cadastreSearchSourceFactory(
  http: HttpClient,
  languageService: LanguageService,
  storageService: StorageService,
  config: ConfigService
) {
  return new CadastreSearchSource(
    http,
    languageService,
    storageService,
    config.getConfig(`searchSources.${CadastreSearchSource.id}`)
  );
}

/**
 * Function that returns a provider for the Cadastre search source
 */
export function provideCadastreSearchSource() {
  return {
    provide: SearchSource,
    useFactory: cadastreSearchSourceFactory,
    multi: true,
    deps: [HttpClient, LanguageService, StorageService, ConfigService]
  };
}

export function withCadastreSource(): SearchSourceFeature<SearchSourceKind.Cadastre> {
  return {
    kind: SearchSourceKind.Cadastre,
    providers: [provideCadastreSearchSource()]
  };
}
