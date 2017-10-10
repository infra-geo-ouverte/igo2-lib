import { Http, Jsonp } from '@angular/http';

import { ConfigService, LanguageService } from '../../core';
import { AuthHttp } from '../../auth';

import { SearchSource } from './search-source';
import { NominatimSearchSource } from './nominatim-search-source';
import { IChercheSearchSource } from './icherche-search-source';
import { DataSourceSearchSource } from './datasource-search-source';


export function nominatimSearchSourcesFactory(http: Http, config: ConfigService) {
  return new NominatimSearchSource(http, config);
}

export function provideNominatimSearchSource() {
  return {
    provide: SearchSource,
    useFactory: (nominatimSearchSourcesFactory),
    multi: true,
    deps: [Http, ConfigService]
  };
}


export function ichercheSearchSourcesFactory(jsonp: Jsonp, config: ConfigService) {
  return new IChercheSearchSource(jsonp, config);
}

export function provideIChercheSearchSource() {
  return {
    provide: SearchSource,
    useFactory: (ichercheSearchSourcesFactory),
    multi: true,
    deps: [Jsonp, ConfigService]
  };
}


export function dataSourceSearchSourcesFactory(
    authHttp: AuthHttp, config: ConfigService, languageService: LanguageService) {
  return new DataSourceSearchSource(authHttp, config, languageService);
}

export function provideDataSourceSearchSource() {
  return {
    provide: SearchSource,
    useFactory: (dataSourceSearchSourcesFactory),
    multi: true,
    deps: [AuthHttp, ConfigService, LanguageService]
  };
}
