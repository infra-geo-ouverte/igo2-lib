import { DirectionsSource } from './directions-source';
import {
  DirectionSourceFeature,
  DirectionSourceKind
} from './directions-source.interface';
import { OgcApiRoutesDirectionsSource } from './ogc-api-routes-directions-source';
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

export function ogcApiRoutesDirectionsSourcesFactory() {
  return new OgcApiRoutesDirectionsSource();
}

export function provideOgcApiRoutesDirectionsSource() {
  return {
    provide: DirectionsSource,
    useFactory: ogcApiRoutesDirectionsSourcesFactory,
    multi: true
  };
}

export function withOgcApiRoutesSource(): DirectionSourceFeature<DirectionSourceKind.OGC_API_ROUTES> {
  return {
    kind: DirectionSourceKind.OGC_API_ROUTES,
    providers: [provideOgcApiRoutesDirectionsSource()]
  };
}
