import { Provider } from '@angular/core';

export interface DirectionsSourceOptions {
  osrm?: OsrmDirectionsSourceOptions;
  ogcApiRoutes?: OgcApiRoutesDirectionsSourceOptions;
  logo?: string;
  defaultSourceId?: string;
}

export type OsrmDirectionsSourceOptions = BaseDirectionsSourceOptions;
export interface OgcApiRoutesDirectionsSourceOptions extends BaseDirectionsSourceOptions {
  routePath?: string;
  httpMethod?: 'GET' | 'POST';
  waypointsParam?: string;
  coordinateSeparator?: string;
  waypointSeparator?: string;
}

export interface BaseDirectionsSourceOptions {
  id: string;
  baseUrl: string;
  name?: string;
  profiles?: BaseDirectionsSourceOptionsProfile[];
}

export interface BaseDirectionsSourceOptionsProfile {
  enabled?: boolean;
  name: string;
  authorization?: BaseDirectionsSourceOptionsProfileAuthorization;
}

export interface BaseDirectionsSourceOptionsProfileAuthorization {
  url: string;
  property: string;
}

export interface DirectionSourceFeature<KindT extends DirectionSourceKind> {
  kind: KindT;
  providers: Provider[];
}

export enum DirectionSourceKind {
  OSRM = 0,
  OGC_API_ROUTES = 1
}
