export interface Catalog {
  id?: string;
  title?: string;
  url?: string;
}

export interface CatalogServiceOptions {
  sources?: Catalog[];
}
