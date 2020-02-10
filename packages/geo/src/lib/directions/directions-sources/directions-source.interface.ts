export interface DirectionsSourceOptions {
  url?: string;
  reverseUrl?: string;
  limit?: number;
  enabled?: boolean;
  type?: string;
  distance?: number;
}
export interface DirectionsSourcesOptions {
  osrm?: DirectionsSourceOptions;
}
