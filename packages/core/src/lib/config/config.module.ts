import { ModuleWithProviders, NgModule } from '@angular/core';

import { provideConfigLoader, provideConfigOptions } from './config.provider';

@NgModule({
  imports: [],
  declarations: [],
  exports: []
})
export class IgoConfigModule {
  static forRoot(): ModuleWithProviders<IgoConfigModule> {
    return {
      ngModule: IgoConfigModule,
      providers: [provideConfigOptions({}), provideConfigLoader()]
    };
  }
}
