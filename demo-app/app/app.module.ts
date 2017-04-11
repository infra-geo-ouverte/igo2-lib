import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { TranslateModule, TranslateLoader,
         TranslateStaticLoader } from 'ng2-translate';

import { IgoModule, provideDefaultSearchSources } from '../../lib/src';

import { AppComponent } from './app.component';

export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, './locale', '.json');
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
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: createTranslateLoader,
      deps: [Http]
    }),
    IgoModule.forRoot()
  ],
  providers: [
    ...provideDefaultSearchSources()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
