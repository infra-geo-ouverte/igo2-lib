import { NgModule } from '@angular/core';

import { CatalogBrowserComponent } from './catalog-browser.component';

/**
 * @deprecated import the CatalogBrowserComponent directly
 */
@NgModule({
  imports: [CatalogBrowserComponent],
  exports: [CatalogBrowserComponent]
})
export class IgoCatalogBrowserModule {}
