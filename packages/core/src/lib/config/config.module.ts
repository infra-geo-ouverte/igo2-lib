import { NgModule, ModuleWithProviders } from '@angular/core';
import { provideConfigOptions, provideConfigLoader } from './config.provider';

@NgModule({
  imports: [],
  declarations: [],
  exports: []
})
export class IgoConfigModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoConfigModule,
      providers: [provideConfigOptions({}), provideConfigLoader()]
    };
  }
}
