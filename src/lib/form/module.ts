import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';
import { IgoMapModule } from '../map';

import { MapFieldComponent } from './fields/map-field';


@NgModule({
  imports: [
    IgoSharedModule,
    IgoMapModule
  ],
  exports: [
    MapFieldComponent
  ],
  declarations: [
    MapFieldComponent
  ]
})
export class IgoFormModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoFormModule,
      providers: []
    };
  }
}

export * from './fields';
