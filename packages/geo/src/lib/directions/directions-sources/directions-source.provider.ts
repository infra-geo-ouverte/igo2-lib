import { DirectionsSource } from './directions-source';
import {
  DirectionSourceFeature,
  DirectionSourceKind
} from './directions-source.interface';
import { OsrmDirectionsSource } from './osrm-directions-source';

export function osrmDirectionsSourcesFactory() {
  return new OsrmDirectionsSource();
}

export function provideOsrmDirectionsSource() {
  return {
    provide: DirectionsSource,
    useFactory: osrmDirectionsSourcesFactory,
    multi: true
  };
}

export function withOsrmSource(): DirectionSourceFeature<DirectionSourceKind.OSRM> {
  return {
    kind: DirectionSourceKind.OSRM,
    providers: [provideOsrmDirectionsSource()]
  };
}
