export interface Catalog {
  id?: string;
  title?: string;
  url?: string;
  type?: string;
  regFilters?: Array<string>;
}

export interface CatalogServiceOptions {
  baseLayers?: boolean;
  sources?: Catalog[];
}
