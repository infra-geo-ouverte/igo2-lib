export interface SearchSourceOptions {
  url?: string;
  limit?: number;
  enabled?: boolean;
}

export interface SearchSourcesOptions {
  icherche?: SearchSourceOptions;
  nominatim?: SearchSourceOptions;
  datasource?: SearchSourceOptions;
}
