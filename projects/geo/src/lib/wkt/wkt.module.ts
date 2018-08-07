import { NgModule, ModuleWithProviders } from '@angular/core';

@NgModule({
  imports: [],
  exports: [],
  declarations: []
})
export class IgoWktModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoWktModule,
      providers: []
    };
  }
}
