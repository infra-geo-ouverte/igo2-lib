import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { WktService } from './shared';


@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [],
  declarations: []
})
export class IgoWktModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoWktModule,
      providers: [
        WktService
      ]
    };
  }
}
