import { Provider } from '@angular/core';

export interface DirectionsSourceOptions extends BaseDirectionsSourceOptions {
  osrm?: OsrmDirectionsSourceOptions;
  logo?: string;
}

export type OsrmDirectionsSourceOptions = BaseDirectionsSourceOptions;

interface BaseDirectionsSourceOptions {
  name?: string;
  baseUrl?: string;
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
