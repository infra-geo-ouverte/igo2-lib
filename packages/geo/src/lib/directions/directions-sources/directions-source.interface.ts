export interface DirectionsSourceOptions extends BaseDirectionsSourceOptions {
  osrm?: OsrmDirectionsSourceOptions;
  logo?: string;
}

export type OsrmDirectionsSourceOptions = BaseDirectionsSourceOptions;

interface BaseDirectionsSourceOptions {
  distance?: number;
  enabled?: boolean;
  limit?: number;
  logo?: string;
  reverseUrl?: string;
  type?: string;
  url?: string;
}
