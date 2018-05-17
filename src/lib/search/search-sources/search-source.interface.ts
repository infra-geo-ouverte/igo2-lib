export interface SearchSourceOptions {
  url?: string;
  locateUrl?: string;
  limit?: number;
  enabled?: boolean;
  type?: string;
  distance?: number;
}

export interface SearchSourcesOptions {
  icherche?: SearchSourceOptions;
  nominatim?: SearchSourceOptions;
  datasource?: SearchSourceOptions;
}
