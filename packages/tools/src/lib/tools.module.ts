import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoContextManagerToolModule } from './context-manager-tool/context-manager-tool.module';
import { IgoContextEditorToolModule } from './context-editor-tool/context-editor-tool.module';
import { IgoCatalogToolModule } from './catalog-tool/catalog-tool.module';
import { IgoCatalogLayersToolModule } from './catalog-layers-tool/catalog-layers-tool.module';
import { IgoDirectionsToolModule } from './directions-tool/directions-tool.module';
import { IgoImportExportToolModule } from './import-export-tool/import-export-tool.module';
import { IgoToolsContextManagerToolModule } from './tools-context-manager-tool/tools-context-manager-tool.module';
import { IgoPermissionsContextManagerToolModule } from './permissions-context-manager-tool/permissions-context-manager-tool.module';
import { IgoMapDetailsToolModule } from './map-details-tool/map-details-tool.module';
import { IgoPrintToolModule } from './print-tool/print-tool.module';
import { IgoSearchResultsToolModule } from './search-results-tool/search-results-tool.module';
import { IgoShareMapToolModule } from './share-map-tool/share-map-tool.module';
import { IgoTimeAnalysisToolModule } from './time-analysis-tool/time-analysis-tool.module';
import { IgoOgcFilterToolModule } from './ogc-filter-tool/ogc-filter-tool.module';
import { IgoAboutToolModule } from './about-tool/about-tool.module';

@NgModule({
  imports: [],
  declarations: [],
  exports: [
    IgoContextManagerToolModule,
    IgoContextEditorToolModule,
    IgoCatalogToolModule,
    IgoCatalogLayersToolModule,
    IgoDirectionsToolModule,
    IgoImportExportToolModule,
    IgoToolsContextManagerToolModule,
    IgoPermissionsContextManagerToolModule,
    IgoMapDetailsToolModule,
    IgoPrintToolModule,
    IgoSearchResultsToolModule,
    IgoShareMapToolModule,
    IgoTimeAnalysisToolModule,
    IgoOgcFilterToolModule,
    IgoAboutToolModule
  ]
})
export class IgoToolsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoToolsModule,
      providers: []
    };
  }
}
