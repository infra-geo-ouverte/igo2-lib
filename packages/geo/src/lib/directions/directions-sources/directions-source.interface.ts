import { Provider } from '@angular/core';

export interface DirectionsSourceOptions {
  osrm?: OsrmDirectionsSourceOptions;
  logo?: string;
  defaultSourceId?: string;
}

export type OsrmDirectionsSourceOptions = BaseDirectionsSourceOptions;

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
  OSRM = 0
}
