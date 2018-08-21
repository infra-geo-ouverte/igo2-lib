import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoCatalogModule } from './catalog/catalog.module';
import { IgoDataSourceModule } from './datasource/datasource.module';
import { IgoDownloadModule } from './download/download.module';
import { IgoFeatureModule } from './feature/feature.module';
import { IgoFilterModule } from './filter/filter.module';
import { IgoFormModule } from './form/form.module';
import { IgoImportExportModule } from './import-export/import-export.module';
import { IgoLayerModule } from './layer/layer.module';
import { IgoMapModule } from './map/map.module';
import { IgoMetadataModule } from './metadata/metadata.module';
import { IgoOverlayModule } from './overlay/overlay.module';
import { IgoPrintModule } from './print/print.module';
import { IgoQueryModule } from './query/query.module';
import { IgoRoutingModule } from './routing/routing.module';
import { IgoSearchModule } from './search/search.module';
import { IgoToastModule } from './toast/toast.module';
import { IgoWktModule } from './wkt/wkt.module';

@NgModule({
  imports: [],
  declarations: [],
  exports: [
    IgoCatalogModule,
    IgoDataSourceModule,
    IgoDownloadModule,
    IgoFeatureModule,
    IgoFilterModule,
    IgoFormModule,
    IgoImportExportModule,
    IgoLayerModule,
    IgoMapModule,
    IgoMetadataModule,
    IgoOverlayModule,
    IgoPrintModule,
    IgoQueryModule,
    IgoRoutingModule,
    IgoSearchModule,
    IgoToastModule,
    IgoWktModule
  ]
})
export class IgoGeoModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoGeoModule,
      providers: []
    };
  }
}
