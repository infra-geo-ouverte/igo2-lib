import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QueryDirective } from './shared/query.directive';
import { QueryService } from './shared/query.service';
import { provideQuerySearchSource } from './shared/query-search-source.providers';

@NgModule({
  imports: [CommonModule],
  exports: [QueryDirective],
  declarations: [QueryDirective],
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
