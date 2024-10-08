import { NgModule } from '@angular/core';

import { IgoAppAboutModule } from './about/about.module';
import { IgoAppCatalogModule } from './catalog/catalog.module';
import { IgoAppContextModule } from './context/context.module';
import { IgoAppDirectionsModule } from './directions/directions.module';
import { IgoAppDrawModule } from './draw/draw.module';
import { IgoAppFilterModule } from './filter/filter.module';
import { IgoAppGeometryFormModule } from './geometry-form/geometry-form.module';
import { IgoAppImportExportModule } from './import-export/import-export.module';
import { IgoAppMapModule } from './map/map.module';
import { IgoAppMeasureModule } from './measure/measure.module';
import { IgoAppPrintModule } from './print/print.module';
import { IgoAppSearchModule } from './search/search.module';
import { IgoAppWorkspaceModule } from './workspace/workspace.module';

/**
 * @deprecated import the components directly
 */
@NgModule({
  imports: [],
  declarations: [],
  exports: [
    IgoAppContextModule,
    IgoAppCatalogModule,
    IgoAppDirectionsModule,
    IgoAppDrawModule,
    IgoAppWorkspaceModule,
    IgoAppImportExportModule,
    IgoAppMapModule,
    IgoAppMeasureModule,
    IgoAppPrintModule,
    IgoAppSearchModule,
    IgoAppFilterModule,
    IgoAppAboutModule,
    IgoAppGeometryFormModule
  ]
})
export class IgoIntegrationModule {}
