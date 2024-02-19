import { NgModule } from '@angular/core';

import { IgoCatalogBrowserModule } from './catalog-browser/catalog-browser.module';
import { IgoCatalogLibraryModule } from './catalog-library/catalog-library.module';

/**
 * @deprecated import the components directly or the CATALOG_DIRECTIVES
 */
@NgModule({
  exports: [IgoCatalogBrowserModule, IgoCatalogLibraryModule]
})
export class IgoCatalogModule {}
