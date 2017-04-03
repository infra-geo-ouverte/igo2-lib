import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpModule, Http } from '@angular/http';

import { IgoSharedModule } from '../shared';

import { SearchService, SearchSourceService } from './shared';
import { SearchSource,
         SearchSourceNominatim } from './search-sources';

import { SearchBarComponent } from './search-bar';
import { SearchResultListComponent } from './search-result-list';
import { SearchResultItemComponent } from './search-result-item';
import { SearchToolComponent } from './search-tool';


export function searchSourceServiceFactory(sources: SearchSource[]) {
  return new SearchSourceService(sources);
}

export function provideSearchSourceService() {
  return {
    provide: SearchSourceService,
    useFactory: searchSourceServiceFactory,
    deps: [SearchSource]
  };
}

export function provideDefaultSearchSources() {
  return [
    {
      provide: SearchSource,
      useClass: SearchSourceNominatim,
      multi: true,
      deps: [Http]
    }
  ];
}

@NgModule({
  imports: [
    IgoSharedModule,
    HttpModule
  ],
  exports: [
    SearchBarComponent,
    SearchResultListComponent,
    SearchToolComponent
  ],
  declarations: [
    SearchBarComponent,
    SearchResultListComponent,
    SearchResultItemComponent,
    SearchToolComponent
  ]
})
export class IgoSearchModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoSearchModule,
      providers: [
        SearchService,
        provideSearchSourceService()
      ]
    };
  }
}

export * from './search-bar';
export * from './search-result-list';
export * from './search-tool';
export * from './search-sources';
export * from './shared';
