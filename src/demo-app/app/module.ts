import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import { MaterialModule } from '@angular/material';

import { IgoModule, provideDefaultSearchSources,
         LanguageLoader, provideLanguageService,
         provideContextServiceOptions } from '../../lib';

import { AppComponent } from './app.component';

export function translateLoader(http: Http) {
  return new LanguageLoader(http, './assets/locale/', '.json');
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot(),
    IgoModule.forRoot()
  ],
  providers: [
    ...provideDefaultSearchSources({
      limit: 5
    }),
    provideContextServiceOptions({
      basePath: './contexts',
      contextListFile: '_contexts.json'
    }),
    /*{
      provide: SearchSource,
      useFactory: (http: Http) => {
        return new SearchSourceNominatim(http, {limit: 4})
      },
      multi: true,
      deps: [Http]
    },*/
    provideLanguageService({
      loader: translateLoader
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
