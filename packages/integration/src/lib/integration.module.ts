import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoAppContextManagerModule } from './context-manager/context-manager.module';
import { IgoAppCatalogModule } from './catalog/catalog.module';
import { IgoAppDirectionsModule } from './directions/directions.module';
import { IgoAppImportExportModule } from './import-export/import-export.module';
import { IgoAppMapModule } from './map/map.module';
import { IgoAppPrintModule } from './print/print.module';
import { IgoAppSearchModule } from './search/search.module';
import { IgoAppShareMapModule } from './share-map/share-map.module';
import { IgoAppFilterModule } from './filter/filter.module';
import { IgoAppAboutModule } from './about/about.module';

@NgModule({
  imports: [],
  declarations: [],
  exports: [
    IgoAppContextManagerModule,
    IgoAppCatalogModule,
    IgoAppDirectionsModule,
    IgoAppImportExportModule,
    IgoAppMapModule,
    IgoAppPrintModule,
    IgoAppSearchModule,
    IgoAppShareMapModule,
    IgoAppFilterModule,
    IgoAppAboutModule
  ]
})
export class IgoIntegrationModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoIntegrationModule,
      providers: []
    };
  }
}
