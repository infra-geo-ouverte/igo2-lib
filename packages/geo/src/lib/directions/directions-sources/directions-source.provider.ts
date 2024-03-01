import { HttpClient } from '@angular/common/http';

import { ConfigService } from '@igo2/core';

import { DirectionsSource } from './directions-source';
import { OsrmPrivateDirectionsSource } from './osrm-private-directions-source';
import { OsrmPublicDirectionsSource } from './osrm-public-directions-source';

export function osrmPublicDirectionsSourcesFactory(
  http: HttpClient,
  config: ConfigService
) {
  return new OsrmPublicDirectionsSource(http, config);
}

export function providePublicOsrmDirectionsSource() {
  return {
    provide: DirectionsSource,
    useFactory: osrmPublicDirectionsSourcesFactory,
    multi: true,
    deps: [HttpClient, ConfigService]
  };
}

export function osrmPrivateDirectionsSourcesFactory(
  http: HttpClient,
  config: ConfigService
) {
  return new OsrmPrivateDirectionsSource(http, config);
}

export function providePrivateOsrmDirectionsSource() {
  return {
    provide: DirectionsSource,
    useFactory: osrmPrivateDirectionsSourcesFactory,
    multi: true,
    deps: [HttpClient, ConfigService]
  };
}
