import { CatalogBrowserComponent } from './catalog-browser/catalog-browser.component';
import { CATALOG_LIBRARY_DIRECTIVES } from './catalog-library';

export * from './shared';
export * from './catalog-browser/catalog-browser.component';
export * from './catalog-library/catalog-library.component';
export * from './catalog-library/add-catalog-dialog.component';

export const CATALOG_DIRECTIVES = [
  ...CATALOG_LIBRARY_DIRECTIVES,
  CatalogBrowserComponent
] as const;
