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

import { IgoCoreModule } from './core/index';
import { IgoContextModule } from './context/index';
import { IgoDataSourceModule } from './datasource/index';
import { IgoFeatureModule } from './feature/index';
import { IgoFormModule } from './form/index';
import { IgoFilterModule } from './filter/index';
import { IgoLayerModule } from './layer/index';
import { IgoMapModule } from './map/index';
import { IgoOverlayModule } from './overlay/index';
import { IgoPrintModule } from './print/index';
import { IgoQueryModule } from './query/index';
import { IgoSearchModule } from './search/index';
import { IgoSharedModule } from './shared/index';
import { IgoToolModule } from './tool/index';

const IGO_MODULES = [
  IgoCoreModule,
  IgoContextModule,
  IgoDataSourceModule,
  IgoFeatureModule,
  IgoFormModule,
  IgoFilterModule,
  IgoLayerModule,
  IgoMapModule,
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
