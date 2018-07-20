import { NgModule, ModuleWithProviders } from '@angular/core';

import { QueryDirective } from './shared/query.directive';

@NgModule({
  imports: [],
  exports: [QueryDirective],
  declarations: [QueryDirective]
})
export class IgoQueryModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoQueryModule
    };
  }
}
