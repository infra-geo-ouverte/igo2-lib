import { NgModule, ModuleWithProviders } from '@angular/core';

@NgModule({
  imports: [],
  declarations: [],
  exports: []
})
export class IgoGeoModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoGeoModule,
      providers: []
    };
  }
}
