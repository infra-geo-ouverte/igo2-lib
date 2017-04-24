import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http } from '@angular/http';
import { MaterialModule } from '@angular/material';

import { IgoModule, provideDefaultSearchSources,
         LanguageLoader, provideLanguageService } from '../../lib';

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
    ...provideDefaultSearchSources(),
    provideLanguageService({
      loader: translateLoader
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
