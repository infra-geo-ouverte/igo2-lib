import { NgModule, ModuleWithProviders } from '@angular/core';

@NgModule({
  imports: [],
  exports: [],
  declarations: []
})
export class IgoMetadataModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoMetadataModule,
      providers: []
    };
  }
}
