import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { IgoMessageModule } from '@igo2/core/message';

import { provideQuerySearchSource } from './shared/query-search-source.providers';
import { QueryDirective } from './shared/query.directive';
import { QueryService } from './shared/query.service';

@NgModule({
  imports: [CommonModule, IgoMessageModule, QueryDirective],
  exports: [QueryDirective],
  providers: [QueryService]
})
export class IgoQueryModule {
  static forRoot(): ModuleWithProviders<IgoQueryModule> {
    return {
      ngModule: IgoQueryModule,
      providers: [provideQuerySearchSource()]
    };
  }
}
