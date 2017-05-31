import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { MetadataService } from './shared';


@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [],
  declarations: []
})
export class IgoMetadataModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoMetadataModule,
      providers: [
        MetadataService
      ]
    };
  }
}
