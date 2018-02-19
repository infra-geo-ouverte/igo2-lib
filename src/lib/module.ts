import { NgModule, ModuleWithProviders } from '@angular/core';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { GestureConfig } from '@angular/material';
import { CustomMaterialModule } from './customMaterialModule';

import 'hammerjs/hammer';

import 'rxjs/add/operator/debounceTime.js';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/skip';
import 'rxjs/add/observable/empty';

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
import { IgoSearchModule } from './search';
import { IgoSharedModule } from './shared';
import { IgoShareMapModule } from './share-map';
import { IgoToolModule } from './tool';

const IGO_MODULES = [
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
  IgoSearchModule,
  IgoSharedModule,
  IgoShareMapModule,
  IgoToolModule
];

@NgModule({
  imports: [
    CustomMaterialModule,

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
    IgoSearchModule.forRoot(),
    IgoShareMapModule.forRoot(),
    IgoToolModule.forRoot()
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
