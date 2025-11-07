import { NgModule } from '@angular/core';

import { CatalogBrowserComponent } from './catalog-browser/catalog-browser.component';
import { CATALOG_LIBRARY_DIRECTIVES } from './catalog-library';

export const CATALOG_DIRECTIVES = [
  CatalogBrowserComponent,
  ...CATALOG_LIBRARY_DIRECTIVES
] as const;

/**
 * @deprecated import the components directly or the CATALOG_DIRECTIVES
 */
@NgModule({
  imports: [...CATALOG_DIRECTIVES],
  exports: [...CATALOG_DIRECTIVES]
})
export class IgoCatalogModule {}
