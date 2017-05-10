import { NgModule, ModuleWithProviders } from '@angular/core';
import { JsonpModule } from '@angular/http';

import { IgoSharedModule } from '../shared';

import { SearchService,
         provideSearchSourceService } from './shared';
import { provideSearchSourceOptions, SearchSourceOptions,
         provideNominatimSearchSource } from './search-sources';

import { SearchBarComponent, SearchUrlParamDirective } from './search-bar';


export function provideDefaultSearchSources(options?: SearchSourceOptions) {
  return [
    provideNominatimSearchSource()
  ];
}

@NgModule({
  imports: [
    JsonpModule,
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
        provideSearchSourceOptions({
          limit: 5
        }),
        provideSearchSourceService(),
        SearchService,
      ]
    };
  }
}
