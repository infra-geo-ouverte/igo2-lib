import { NgModule } from '@angular/core';

import { IgoAppContextModule } from './context/context.module';
import { IgoAppCatalogModule } from './catalog/catalog.module';
import { IgoAppDirectionsModule } from './directions/directions.module';
import { IgoAppImportExportModule } from './import-export/import-export.module';
import { IgoAppMapModule } from './map/map.module';
import { IgoAppPrintModule } from './print/print.module';
import { IgoAppSearchModule } from './search/search.module';
import { IgoAppFilterModule } from './filter/filter.module';
import { IgoAppAboutModule } from './about/about.module';

@NgModule({
  imports: [],
  declarations: [],
  exports: [
    IgoAppContextModule,
    IgoAppCatalogModule,
    IgoAppDirectionsModule,
    IgoAppImportExportModule,
    IgoAppMapModule,
    IgoAppPrintModule,
    IgoAppSearchModule,
    IgoAppFilterModule,
    IgoAppAboutModule
  ]
})
export class IgoIntegrationModule {}
