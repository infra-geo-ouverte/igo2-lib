import { HttpClient } from '@angular/common/http';

import { ConfigService } from '../../core';
import { RoutingSource } from './routing-source';
//  import { NominatimRoutingSource } from './nominatim-search-source';
import { OsrmRoutingSource } from './osrm-routing-source';
//  import { DataSourceRoutingSource } from './datasource-search-source';



export function osrmRoutingSourcesFactory(http: HttpClient, config: ConfigService) {
  return new OsrmRoutingSource(http, config);
}

export function provideOsrmRoutingSource() {
  return {
    provide: RoutingSource,
    useFactory: (osrmRoutingSourcesFactory),
    multi: true,
    deps: [HttpClient, ConfigService]
  };
}


