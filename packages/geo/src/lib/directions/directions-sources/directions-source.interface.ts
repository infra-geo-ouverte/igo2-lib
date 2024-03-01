export interface DirectionsSourceOptions extends BaseDirectionsSourceOptions {
  osrm?: OsrmDirectionsSourceOptions;
  logo?: string;
}

export type OsrmDirectionsSourceOptions = BaseDirectionsSourceOptions;

interface BaseDirectionsSourceOptions {
  enabled?: boolean;
  name?: string;
  type?: 'public' | 'private';
  url?: string;
  userVerifUrl?: string;
}
