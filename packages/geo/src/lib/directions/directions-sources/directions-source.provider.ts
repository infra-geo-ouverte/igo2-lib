import { HttpClient } from '@angular/common/http';

import { ConfigService } from '@igo2/core/config';

import { DirectionsSource } from './directions-source';
import {
  DirectionSourceFeature,
  DirectionSourceKind
} from './directions-source.interface';
import { OsrmDirectionsSource } from './osrm-directions-source';

export function osrmDirectionsSourcesFactory(
  http: HttpClient,
  config: ConfigService
) {
  return new OsrmDirectionsSource(http, config);
}

export function provideOsrmDirectionsSource() {
  return {
    provide: DirectionsSource,
    useFactory: osrmDirectionsSourcesFactory,
    multi: true,
    deps: [HttpClient, ConfigService]
  };
}

export function withOsrmSource(): DirectionSourceFeature<DirectionSourceKind.OSRM> {
  return {
    kind: DirectionSourceKind.OSRM,
    providers: [provideOsrmDirectionsSource()]
  };
}
