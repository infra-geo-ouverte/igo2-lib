export interface RoutingSourceOptions {
  url?: string;
  reverseUrl?: string;
  limit?: number;
  enabled?: boolean;
  type?: string;
  distance?: number;
}
export interface RoutingSourcesOptions {
  osrm?: RoutingSourceOptions;
}
