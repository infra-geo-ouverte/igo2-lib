import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoCatalogModule } from './catalog/catalog.module';
import { IgoDataSourceModule } from './datasource/datasource.module';
import { IgoDownloadModule } from './download/download.module';
import { IgoDrawingToolModule } from './draw/drawingTool.module';
import { IgoFeatureModule } from './feature/feature.module';
import { IgoFilterModule } from './filter/filter.module';
import { IgoGeometryModule } from './geometry/geometry.module';
import { IgoImportExportModule } from './import-export/import-export.module';
import { IgoLayerModule } from './layer/layer.module';
import { IgoMapModule } from './map/map.module';
import { IgoMeasureModule } from './measure/measure.module';
import { IgoMetadataModule } from './metadata/metadata.module';
import { IgoOverlayModule } from './overlay/overlay.module';
import { IgoPrintModule } from './print/print.module';
import { IgoQueryModule } from './query/query.module';
import { IgoDirectionsModule } from './directions/directions.module';
import { IgoSearchModule } from './search/search.module';
import { IgoToastModule } from './toast/toast.module';
import { IgoGeoWorkspaceModule } from './workspace/workspace.module';
import { IgoWktModule } from './wkt/wkt.module';
import { IgoStyleModule } from './style/style.module';

@NgModule({
  imports: [],
  declarations: [],
  exports: [
    IgoCatalogModule,
    IgoDataSourceModule,
    IgoDownloadModule,
    IgoDrawingToolModule,
    IgoFeatureModule,
    IgoFilterModule,
    IgoGeometryModule,
    IgoImportExportModule,
    IgoLayerModule,
    IgoMapModule,
    IgoMeasureModule,
    IgoMetadataModule,
    IgoOverlayModule,
    IgoPrintModule,
    IgoQueryModule,
    IgoDirectionsModule,
    IgoSearchModule,
    IgoToastModule,
    IgoGeoWorkspaceModule,
    IgoStyleModule,
    IgoWktModule
  ]
})
export class IgoGeoModule {
  static forRoot(): ModuleWithProviders<IgoGeoModule> {
    return {
      ngModule: IgoGeoModule,
      providers: []
    };
  }
}
