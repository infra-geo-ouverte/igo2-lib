import { ModuleWithProviders, NgModule } from '@angular/core';

import { provideConfig } from './config.provider';

/**
 * @deprecated import the provideConfig directly
 */
@NgModule({
  imports: [],
  declarations: [],
  exports: []
})
export class IgoConfigModule {
  static forRoot(): ModuleWithProviders<IgoConfigModule> {
    return {
      ngModule: IgoConfigModule,
      providers: [provideConfig({})]
    };
  }
}
