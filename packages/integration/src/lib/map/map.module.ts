import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatTabsModule, MatListModule, MatIconModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import {
  IgoLayerModule,
  IgoMetadataModule,
  IgoDownloadModule,
  IgoFilterModule,
  IgoImportExportModule
} from '@igo2/geo';

import { IgoContextModule } from '@igo2/context';

import { MapDetailsToolComponent } from './map-details-tool/map-details-tool.component';
import { MapToolComponent } from './map-tool/map-tool.component';
import { MapToolsComponent } from './map-tools/map-tools.component';
import { MapLegendToolComponent } from './map-legend/map-legend-tool.component';

@NgModule({
  imports: [
    CommonModule,
    MatTabsModule,
    MatListModule,
    MatIconModule,
    IgoLanguageModule,
    IgoLayerModule,
    IgoMetadataModule,
    IgoDownloadModule,
    IgoImportExportModule,
    IgoFilterModule,
    IgoContextModule
  ],
  declarations: [MapToolComponent, MapToolsComponent, MapDetailsToolComponent, MapLegendToolComponent],
  exports: [MapToolComponent, MapToolsComponent, MapDetailsToolComponent, MapLegendToolComponent],
  entryComponents: [MapToolComponent, MapToolsComponent, MapDetailsToolComponent, MapLegendToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppMapModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoAppMapModule,
      providers: []
    };
  }
}
