import { NgModule } from '@angular/core';

import { IgoDirectionsModule } from './directions/directions.module';
import { IgoDownloadModule } from './download/download.module';
import { IgoFilterModule } from './filter/filter.module';
import { IgoImportExportModule } from './import-export/import-export.module';
import { IgoLayerModule } from './layer/layer.module';
import { IgoMetadataModule } from './metadata/metadata.module';
import { IgoOverlayModule } from './overlay/overlay.module';
import { IgoQueryModule } from './query/query.module';
import { IgoSearchModule } from './search/search.module';
import { IgoStyleModule } from './style/style.module';
import { IgoToastModule } from './toast/toast.module';
import { IgoWktModule } from './wkt/wkt.module';
import { IgoGeoWorkspaceModule } from './workspace/workspace.module';

@NgModule({
  imports: [],
  declarations: [],
  exports: [
    IgoDownloadModule,
    IgoFilterModule,
    IgoImportExportModule,
    IgoLayerModule,
    IgoMetadataModule,
    IgoOverlayModule,
    IgoQueryModule,
    IgoDirectionsModule,
    IgoSearchModule,
    IgoToastModule,
    IgoGeoWorkspaceModule,
    IgoStyleModule,
    IgoWktModule
  ]
})
export class IgoGeoModule {}
