import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpModule } from '@angular/http';

import { IgoSharedModule } from '../shared';

import { QueryService } from './shared';
import { QueryDirective } from './query';


@NgModule({
  imports: [
    IgoSharedModule,
    HttpModule
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
