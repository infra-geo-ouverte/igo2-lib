import { NgModule, ModuleWithProviders } from '@angular/core';
import { Http } from '@angular/http';

import { IgoSharedModule } from '../shared';

import { SearchService, SearchSourceService } from './shared';
import { SearchSource,
         SearchSourceOptions,
         SearchSourceNominatim } from './search-sources';

import { SearchBarComponent, SearchUrlParamDirective } from './search-bar';


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

export function nominatimSearchSourcesFactory(http: Http, options: any) {
  return new SearchSourceNominatim(http, options);
}

export function provideDefaultSearchSources(options?: SearchSourceOptions) {
  return [
    {
      provide: 'searchSourceOptions',
      useValue: options
    },
    {
      provide: SearchSource,
      useFactory: nominatimSearchSourcesFactory,
      multi: true,
      deps: [Http, 'searchSourceOptions']
    }
  ];
}

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
        SearchService,
        provideSearchSourceService()
      ]
    };
  }
}

export * from './search-bar';
export * from './search-sources';
export * from './shared';
