import { DirectionsSource } from './directions-source';
import {
  DirectionSourceFeature,
  DirectionSourceKind,
  OSRM_DIRECTIONS_SOURCE_OPTIONS,
  OsrmDirectionsSourceOptions
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

export function withOsrmSource(
  options?: Partial<OsrmDirectionsSourceOptions>
): DirectionSourceFeature<DirectionSourceKind.OSRM> {
  return {
    kind: DirectionSourceKind.OSRM,
    providers: [
      provideOsrmDirectionsSource(),
      ...(options
        ? [{ provide: OSRM_DIRECTIONS_SOURCE_OPTIONS, useValue: options }]
        : [])
    ]
  };
}
