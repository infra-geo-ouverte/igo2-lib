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
import { IgoLanguageModule } from './language/index';
import { IgoContextModule } from './context/index';
import { IgoFeatureModule } from './feature/index';
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
  IgoLanguageModule,
  IgoContextModule,
  IgoFeatureModule,
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
    MaterialModule.forRoot(),

    IgoCoreModule.forRoot(),
    ...IGO_MODULES.map(m => m.forRoot())
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
