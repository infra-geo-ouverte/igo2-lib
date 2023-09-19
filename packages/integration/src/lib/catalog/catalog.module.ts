import { NgModule } from '@angular/core';

import { IgoAppCatalogLibraryToolModule } from './catalog-library-tool/catalog-library-tool.module';
import { IgoAppCatalogBrowserToolModule } from './catalog-browser-tool/catalog-browser-tool.module';

@NgModule({
  imports: [],
  exports: [IgoAppCatalogLibraryToolModule, IgoAppCatalogBrowserToolModule],
  declarations: []
})
export class IgoAppCatalogModule {}
