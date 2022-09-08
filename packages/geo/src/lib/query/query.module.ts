import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLanguageModule, IgoMessageModule } from '@igo2/core';

import { QueryDirective } from './shared/query.directive';
import { QueryService } from './shared/query.service';
import { provideQuerySearchSource } from './shared/query-search-source.providers';

@NgModule({
  imports: [CommonModule, IgoLanguageModule, IgoMessageModule],
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
