export interface SearchSourceOptions {
  searchUrl?: string;
  locateUrl?: string;
  limit?: number;
  locateLimit?: number;
  enabled?: boolean;
  type?: string;
  distance?: number;
  zoomMaxOnSelect?: number;
}

export interface SearchSourcesOptions {
  icherche?: SearchSourceOptions;
  nominatim?: SearchSourceOptions;
  datasource?: SearchSourceOptions;
  reseautq?: SearchSourceOptions;
}
