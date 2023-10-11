import { ModuleWithProviders, NgModule } from '@angular/core';

import { ClickoutDirective } from './clickout.directive';

@NgModule({
  imports: [],
  declarations: [ClickoutDirective],
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
