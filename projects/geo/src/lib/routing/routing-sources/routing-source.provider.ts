import { HttpClient } from '@angular/common/http';

import { ConfigService } from '@igo2/core';

import { RoutingSource } from './routing-source';
import { OsrmRoutingSource } from './osrm-routing-source';

export function osrmRoutingSourcesFactory(
  http: HttpClient,
  config: ConfigService
) {
  return new OsrmRoutingSource(http, config);
}

export function provideOsrmRoutingSource() {
  return {
    provide: RoutingSource,
    useFactory: osrmRoutingSourcesFactory,
    multi: true,
    deps: [HttpClient, ConfigService]
  };
}
