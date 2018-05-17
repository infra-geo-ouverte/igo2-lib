export interface SearchSourceOptions {
  url?: string;
  reverseUrl?: string;
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
