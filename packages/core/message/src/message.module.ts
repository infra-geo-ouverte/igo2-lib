import { ModuleWithProviders, NgModule } from '@angular/core';

import { provideMessage } from './shared/message.provider';

/**
 * @deprecated import the provideMessage directly
 */
@NgModule({
  imports: [],
  providers: [provideMessage()],
  exports: []
})
export class IgoMessageModule {
  static forRoot(): ModuleWithProviders<IgoMessageModule> {
    return {
      ngModule: IgoMessageModule,
      providers: []
    };
  }
}
