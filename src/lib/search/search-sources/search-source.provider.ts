import { InjectionToken } from '@angular/core';
import { Http, Jsonp } from '@angular/http';

import { SearchSource } from './search-source';
import { SearchSourceOptions } from './search-source.interface';
import { NominatimSearchSource } from './nominatim-search-source';
import { IChercheSearchSource } from './icherche-search-source';
import { DataSourceSearchSource } from './datasource-search-source';


export let SEARCH_SOURCE_OPTIONS =
  new InjectionToken<SearchSourceOptions>('searchSourceOptions');

export function provideSearchSourceOptions(options: SearchSourceOptions) {
  return {
    provide: SEARCH_SOURCE_OPTIONS,
    useValue: options
  };
}


export function nominatimSearchSourcesFactory(http: Http, options: any) {
  return new NominatimSearchSource(http, options);
}

export function provideNominatimSearchSource() {
  return {
    provide: SearchSource,
    useFactory: (nominatimSearchSourcesFactory),
    multi: true,
    deps: [Http, SEARCH_SOURCE_OPTIONS]
  };
}


export function ichercheSearchSourcesFactory(jsonp: Jsonp, options: any) {
  return new IChercheSearchSource(jsonp, options);
}

export function provideIChercheSearchSource() {
  return {
    provide: SearchSource,
    useFactory: (ichercheSearchSourcesFactory),
    multi: true,
    deps: [Jsonp, SEARCH_SOURCE_OPTIONS]
  };
}


export function dataSourceSearchSourcesFactory(jsonp: Jsonp, options: any) {
  return new DataSourceSearchSource(jsonp, options);
}

export function provideDataSourceSearchSource() {
  return {
    provide: SearchSource,
    useFactory: (dataSourceSearchSourcesFactory),
    multi: true,
    deps: [Jsonp, SEARCH_SOURCE_OPTIONS]
  };
}
