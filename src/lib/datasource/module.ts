import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';
import { CapabilitiesService, DataSourceService } from './shared';


@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [],
  declarations: []
})
export class IgoDataSourceModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoDataSourceModule,
      providers: [
        DataSourceService,
        CapabilitiesService
      ]
    };
  }
}

export * from './shared';
