import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { QueryService, QueryDirective } from './shared';


@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [
    QueryDirective
  ],
  declarations: [
    QueryDirective
  ]
})
export class IgoQueryModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoQueryModule,
      providers: [
        QueryService
      ]
    };
  }
}
