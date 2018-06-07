import { NgModule, ModuleWithProviders } from '@angular/core';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { GestureConfig } from '@angular/material';
import { CustomMaterialModule } from './customMaterialModule';

import 'hammerjs/hammer';

import { IgoAnalyticsModule } from './analytics';
import { IgoAuthModule } from './auth';
import { IgoCoreModule } from './core';
import { IgoContextModule } from './context';
import { IgoCatalogModule } from './catalog';
import { IgoDataSourceModule } from './datasource';
import { IgoDownloadModule } from './download';
import { IgoFeatureModule } from './feature';
import { IgoFormModule } from './form';
import { IgoFilterModule } from './filter';
import { IgoImportExportModule } from './import-export';
import { IgoLayerModule } from './layer';
import { IgoMapModule } from './map';
import { IgoMetadataModule } from './metadata';
import { IgoOverlayModule } from './overlay';
import { IgoPrintModule } from './print';
import { IgoQueryModule } from './query';
import { IgoRoutingModule } from './routing';
import { IgoSearchModule } from './search';
import { IgoSharedModule } from './shared';
import { IgoShareMapModule } from './share-map';
import { IgoToolModule } from './tool';
import { IgoWktModule } from './wkt';

const IGO_MODULES = [
  IgoAnalyticsModule,
  IgoAuthModule,
  IgoCoreModule,
  IgoContextModule,
  IgoCatalogModule,
  IgoDataSourceModule,
  IgoDownloadModule,
  IgoFeatureModule,
  IgoFormModule,
  IgoFilterModule,
  IgoImportExportModule,
  IgoLayerModule,
  IgoMapModule,
  IgoMetadataModule,
  IgoOverlayModule,
  IgoPrintModule,
  IgoQueryModule,
  IgoRoutingModule,
  IgoSearchModule,
  IgoSharedModule,
  IgoShareMapModule,
  IgoToolModule,
  IgoWktModule
];

@NgModule({
  imports: [
    CustomMaterialModule,

    IgoAnalyticsModule.forRoot(),
    IgoAuthModule.forRoot(),
    IgoCoreModule.forRoot(),
    IgoContextModule.forRoot(),
    IgoCatalogModule.forRoot(),
    IgoDataSourceModule.forRoot(),
    IgoDownloadModule.forRoot(),
    IgoFeatureModule.forRoot(),
    IgoFormModule.forRoot(),
    IgoFilterModule.forRoot(),
    IgoImportExportModule.forRoot(),
    IgoLayerModule.forRoot(),
    IgoMapModule.forRoot(),
    IgoMetadataModule.forRoot(),
    IgoOverlayModule.forRoot(),
    IgoPrintModule.forRoot(),
    IgoQueryModule.forRoot(),
    IgoRoutingModule.forRoot(),
    IgoSearchModule.forRoot(),
    IgoShareMapModule.forRoot(),
    IgoToolModule.forRoot(),
    IgoWktModule.forRoot()
  ],
  exports: IGO_MODULES
})
export class IgoModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoModule,
      providers: [
        // Need this provider to support touch gestures. Used by the slider.
        { provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig }
      ]
    };
  }
}
