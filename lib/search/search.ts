import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '@angular/material';
import { HttpModule, Http } from '@angular/http';

import { SearchService, SearchSourceService } from './shared';
import { SearchSource,
         SearchSourceNominatim } from './search-sources';

import { SearchBarComponent } from './search-bar/search-bar.component';


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
    CommonModule,
    FormsModule,
    MaterialModule,
    HttpModule
  ],
  exports: [
    SearchBarComponent
  ],
  declarations: [
    SearchBarComponent
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
