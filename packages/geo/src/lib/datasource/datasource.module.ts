import { ModuleWithProviders, NgModule } from '@angular/core';

@NgModule({
  imports: [],
  exports: [],
  declarations: []
})
export class IgoDataSourceModule {
  static forRoot(): ModuleWithProviders<IgoDataSourceModule> {
    return {
      ngModule: IgoDataSourceModule,
      providers: []
    };
  }
}
