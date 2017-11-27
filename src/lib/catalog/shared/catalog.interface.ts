export interface Catalog {
  id?: string;
  title?: string;
  url?: string;
  type?: string;
}

export interface CatalogServiceOptions {
  baseLayers?: boolean;
  sources?: Catalog[];
}
