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
  IgoFilterModule
} from '@igo2/geo';

import { IgoContextModule } from '@igo2/context';

import { MapDetailsToolComponent } from './map-details-tool/map-details-tool.component';
import { MapToolComponent } from './map-tool/map-tool.component';

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
    IgoFilterModule,
    IgoContextModule
  ],
  declarations: [MapToolComponent, MapDetailsToolComponent],
  exports: [MapToolComponent, MapDetailsToolComponent],
  entryComponents: [MapToolComponent, MapDetailsToolComponent],
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
