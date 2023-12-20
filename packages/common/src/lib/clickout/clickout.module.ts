import { ModuleWithProviders, NgModule } from '@angular/core';

import { ClickoutDirective } from './clickout.directive';

/**
 * @deprecated import the ClickoutDirective directly
 */
@NgModule({
  imports: [ClickoutDirective],
  exports: [ClickoutDirective]
})
export class IgoClickoutModule {
  static forRoot(): ModuleWithProviders<IgoClickoutModule> {
    return {
      ngModule: IgoClickoutModule,
      providers: []
    };
  }
}
