import { NgModule } from '@angular/core';

import { IgoAppCatalogBrowserToolModule } from './catalog-browser-tool/catalog-browser-tool.module';
import { IgoAppCatalogLibraryToolModule } from './catalog-library-tool/catalog-library-tool.module';

@NgModule({
  imports: [],
  exports: [IgoAppCatalogLibraryToolModule, IgoAppCatalogBrowserToolModule],
  declarations: []
})
export class IgoAppCatalogModule {}
