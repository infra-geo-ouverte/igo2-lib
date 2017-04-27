import { NgModule, ModuleWithProviders } from '@angular/core';
import { MaterialModule } from '@angular/material';

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
  IgoQueryModule,
  IgoSearchModule,
  IgoSharedModule,
  IgoToolModule
];

@NgModule({
  imports: [
    MaterialModule.forRoot(),

    IgoCoreModule.forRoot(),
    IgoLanguageModule.forRoot(),
    IgoContextModule.forRoot(),
    IgoFeatureModule.forRoot(),
    IgoFilterModule.forRoot(),
    IgoLayerModule.forRoot(),
    IgoMapModule.forRoot(),
    IgoOverlayModule.forRoot(),
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
      providers: []
    };
  }
}
