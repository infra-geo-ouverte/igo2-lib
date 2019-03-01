export interface SearchSourceOptions {
  searchUrl?: string;
  locateUrl?: string;
  limit?: number;
  locateLimit?: number;
  enabled?: boolean;
  type?: string;
  distance?: number;
  zoomMaxOnSelect?: number;
  propertiesAlias?: PropertiesAlias[];
  queryFormat?: any;
}

export interface SearchSourcesOptions {
  icherche?: SearchSourceOptions;
  nominatim?: SearchSourceOptions;
  datasource?: SearchSourceOptions;
  reseautq?: SearchSourceOptions;
}

export interface PropertiesAlias {
  name: any;
  alias: any;
}
