import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { SearchService,
         provideSearchSourceService } from './shared';

import { SearchBarComponent, SearchUrlParamDirective } from './search-bar';


@NgModule({
  imports: [
    IgoSharedModule
  ],
  exports: [
    SearchBarComponent,
    SearchUrlParamDirective
  ],
  declarations: [
    SearchBarComponent,
    SearchUrlParamDirective
  ]
})
export class IgoSearchModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoSearchModule,
      providers: [
        provideSearchSourceService(),
        SearchService,
      ]
    };
  }
}
