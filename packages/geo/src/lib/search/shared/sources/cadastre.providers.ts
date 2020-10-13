import { HttpClient } from '@angular/common/http';

import { ConfigService, LanguageService } from '@igo2/core';

import { SearchSource } from './source';
import { CadastreSearchSource } from './cadastre';

/**
 * Cadastre search source factory
 * @ignore
 */
export function cadastreSearchSourceFactory(
  http: HttpClient,
  languageService: LanguageService,
  config: ConfigService
) {
  return new CadastreSearchSource(
    http,
    languageService,
    config.getConfig(`searchSources.${CadastreSearchSource.id}`),
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
    deps: [HttpClient, LanguageService, ConfigService]
  };
}
