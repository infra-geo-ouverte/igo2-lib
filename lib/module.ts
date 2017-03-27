import { NgModule, ModuleWithProviders } from '@angular/core';
import { MaterialModule } from '@angular/material';

import 'rxjs/add/operator/debounceTime.js';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

import 'openlayers';

import { IgoCoreModule } from './core/index';
import { IgoSearchModule } from './search/index';

const IGO_MODULES = [
  IgoSearchModule
];

@NgModule({
  imports: [
    MaterialModule.forRoot(),
    IgoCoreModule.forRoot(),
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
