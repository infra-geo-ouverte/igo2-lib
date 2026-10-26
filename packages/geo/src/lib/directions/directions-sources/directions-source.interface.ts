import { InjectionToken, Provider } from '@angular/core';

export const OSRM_DIRECTIONS_SOURCE_OPTIONS = new InjectionToken<
  Partial<OsrmDirectionsSourceOptions>
>('OsrmDirectionsSourceOptions');

export interface DirectionsSourceOptions {
  osrm?: OsrmDirectionsSourceOptions;
  logo?: string;
  defaultSourceId?: string;
}

export type OsrmDirectionsSourceOptions = BaseDirectionsSourceOptions;

export interface BaseDirectionsSourceOptions {
  id: string;
  baseUrl: string;
  apiKey?: string;
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
