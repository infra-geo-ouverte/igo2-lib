import { NgModule, ModuleWithProviders } from '@angular/core';

@NgModule({
  imports: [],
  exports: [],
  declarations: []
})
export class IgoWktModule {
  static forRoot(): ModuleWithProviders<IgoWktModule> {
    return {
      ngModule: IgoWktModule,
      providers: []
    };
  }
}
