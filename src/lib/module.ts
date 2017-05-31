import { NgModule, ModuleWithProviders } from '@angular/core';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { MaterialModule, GestureConfig } from '@angular/material';

import 'hammerjs/hammer';

import 'rxjs/add/operator/debounceTime.js';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/combineLatest';

import { IgoCoreModule } from './core';
import { IgoContextModule } from './context';
import { IgoDataSourceModule } from './datasource';
import { IgoFeatureModule } from './feature';
import { IgoFormModule } from './form';
import { IgoFilterModule } from './filter';
import { IgoLayerModule } from './layer';
import { IgoMapModule } from './map';
import { IgoMetadataModule } from './metadata';
import { IgoOverlayModule } from './overlay';
import { IgoPrintModule } from './print';
import { IgoQueryModule } from './query';
import { IgoSearchModule } from './search';
import { IgoSharedModule } from './shared';
import { IgoToolModule } from './tool';

const IGO_MODULES = [
  IgoCoreModule,
  IgoContextModule,
  IgoDataSourceModule,
  IgoFeatureModule,
  IgoFormModule,
  IgoFilterModule,
  IgoLayerModule,
  IgoMapModule,
  IgoMetadataModule,
  IgoOverlayModule,
  IgoPrintModule,
  IgoQueryModule,
  IgoSearchModule,
  IgoSharedModule,
  IgoToolModule
];

@NgModule({
  imports: [
    MaterialModule,

    IgoCoreModule.forRoot(),
    IgoDataSourceModule.forRoot(),
    IgoContextModule.forRoot(),
    IgoFeatureModule.forRoot(),
    IgoFormModule.forRoot(),
    IgoFilterModule.forRoot(),
    IgoLayerModule.forRoot(),
    IgoMapModule.forRoot(),
    IgoMetadataModule.forRoot(),
    IgoOverlayModule.forRoot(),
    IgoPrintModule.forRoot(),
    IgoQueryModule.forRoot(),
    IgoSearchModule.forRoot(),
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
