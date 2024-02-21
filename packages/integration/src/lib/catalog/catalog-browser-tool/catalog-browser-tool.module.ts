import { NgModule } from '@angular/core';

import { CatalogBrowserToolComponent } from './catalog-browser-tool.component';

/**
 * @deprecated import the CatalogBrowserToolComponent directly
 */
@NgModule({
  imports: [CatalogBrowserToolComponent],
  exports: [CatalogBrowserToolComponent]
})
export class IgoAppCatalogBrowserToolModule {}
