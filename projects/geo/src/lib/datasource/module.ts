import { NgModule, ModuleWithProviders } from '@angular/core';

@NgModule({
  imports: [],
  exports: [],
  declarations: []
})
export class IgoDataSourceModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoDataSourceModule,
      providers: []
    };
  }
}
