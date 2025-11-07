import { NgModule } from '@angular/core';

import { CatalogLibraryToolComponent } from './catalog-library-tool.component';

/**
 * @deprecated import the CatalogLibraryToolComponent directly
 */
@NgModule({
  imports: [CatalogLibraryToolComponent],
  exports: [CatalogLibraryToolComponent]
})
export class IgoAppCatalogLibraryToolModule {}
