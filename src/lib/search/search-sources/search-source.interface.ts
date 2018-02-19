export interface SearchSourceOptions {
  url?: string;
  limit?: number;
  enabled?: boolean;
  type?: string;
}

export interface SearchSourcesOptions {
  icherche?: SearchSourceOptions;
  nominatim?: SearchSourceOptions;
  datasource?: SearchSourceOptions;
}
