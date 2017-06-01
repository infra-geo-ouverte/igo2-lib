import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { RouterModule } from '@angular/router';

import { IgoModule, provideSearchSourceOptions,
         provideIChercheSearchSource,
         provideNominatimSearchSource,
         provideDataSourceSearchSource,
         LanguageLoader, provideLanguageLoader,
         provideContextServiceOptions,
         RouteService, provideConfigOptions } from '../../lib';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';


export function languageLoader(http: Http) {
  return new LanguageLoader(http, './assets/locale/', '.json');
}


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([]),

    FormsModule,
    HttpModule,
    MaterialModule,
    IgoModule.forRoot()
  ],
  providers: [
    provideConfigOptions({
      default: environment.igo,
      path: './config/config.json'
    }),
    RouteService,
    provideSearchSourceOptions({
      limit: 5
    }),
    provideNominatimSearchSource(),
    provideIChercheSearchSource(),
    provideDataSourceSearchSource(),
    provideContextServiceOptions({
      basePath: './contexts',
      contextListFile: '_contexts.json'
    }),
    provideLanguageLoader(languageLoader)
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
