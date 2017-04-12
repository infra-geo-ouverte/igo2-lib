import { NgModule, ModuleWithProviders } from '@angular/core';
import { Http } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { TranslateModule, TranslateLoader,
         TranslateStaticLoader } from 'ng2-translate';

import 'rxjs/add/operator/debounceTime.js';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';

import 'openlayers';

import { IgoCoreModule } from './core/index';
import { IgoLanguageModule } from './language/index';
import { IgoFeatureModule } from './feature/index';
import { IgoFilterModule } from './filter/index';
import { IgoLayerModule } from './layer/index';
import { IgoMapModule } from './map/index';
import { IgoOverlayModule } from './overlay/index';
import { IgoQueryModule } from './query/index';
import { IgoSearchModule } from './search/index';
import { IgoSharedModule } from './shared/index';

export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, './locale', '.json');
}

const IGO_MODULES = [
  IgoLanguageModule,
  IgoFeatureModule,
  IgoFilterModule,
  IgoLayerModule,
  IgoMapModule,
  IgoOverlayModule,
  IgoQueryModule,
  IgoSearchModule,
  IgoSharedModule
];

@NgModule({
  imports: [
    MaterialModule.forRoot(),
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: createTranslateLoader,
      deps: [Http]
    }),

    IgoCoreModule.forRoot(),
    IgoLanguageModule.forRoot(),
    IgoFeatureModule.forRoot(),
    IgoFilterModule.forRoot(),
    IgoLayerModule.forRoot(),
    IgoMapModule.forRoot(),
    IgoOverlayModule.forRoot(),
    IgoQueryModule.forRoot(),
    IgoSearchModule.forRoot()
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
