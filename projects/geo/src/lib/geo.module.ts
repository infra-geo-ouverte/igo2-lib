import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoDataSourceModule } from './datasource/module';
import { IgoLayerModule } from './layer/module';
import { IgoMapModule } from './map/module';

@NgModule({
  imports: [IgoDataSourceModule, IgoLayerModule, IgoMapModule],
  declarations: [],
  exports: [IgoDataSourceModule, IgoLayerModule, IgoMapModule]
})
export class IgoGeoModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoGeoModule,
      providers: []
    };
  }
}
