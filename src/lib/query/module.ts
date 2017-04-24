import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { QueryService } from './shared';
import { QueryDirective } from './query';


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

export * from './shared';
export * from './query';
