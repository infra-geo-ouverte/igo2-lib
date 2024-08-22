import { NgModule } from '@angular/core';

import { IgoAppCatalogBrowserToolModule } from './catalog-browser-tool/catalog-browser-tool.module';
import { IgoAppCatalogLibraryToolModule } from './catalog-library-tool/catalog-library-tool.module';

/**
 * @deprecated import the components directly
 */
@NgModule({
  exports: [IgoAppCatalogLibraryToolModule, IgoAppCatalogBrowserToolModule]
})
export class IgoAppCatalogModule {}
