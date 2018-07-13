import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoCatalogModule } from './catalog/module';
import { IgoContextModule } from './context/module';
import { IgoDataSourceModule } from './datasource/module';
import { IgoDownloadModule } from './download/module';
import { IgoFeatureModule } from './feature/module';
import { IgoFormModule } from './form/module';
import { IgoImportExportModule } from './import-export/module';
import { IgoLayerModule } from './layer/module';
import { IgoMapModule } from './map/module';
import { IgoMetadataModule } from './metadata/module';
import { IgoOverlayModule } from './overlay/module';
import { IgoShareMapModule } from './share-map/module';
import { IgoWktModule } from './wkt/module';

@NgModule({
  imports: [],
  declarations: [],
  exports: [
    IgoCatalogModule,
    IgoContextModule,
    IgoDataSourceModule,
    IgoDownloadModule,
    IgoFeatureModule,
    IgoFormModule,
    IgoImportExportModule,
    IgoLayerModule,
    IgoMapModule,
    IgoMetadataModule,
    IgoOverlayModule,
    IgoShareMapModule,
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
