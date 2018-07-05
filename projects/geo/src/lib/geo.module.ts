import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoMapModule } from './map';

@NgModule({
  imports: [IgoMapModule],
  declarations: [],
  exports: [IgoMapModule]
})
export class IgoGeoModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoGeoModule,
      providers: []
    };
  }
}
