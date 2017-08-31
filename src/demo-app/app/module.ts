import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MdSidenavModule, MdCardModule, MdIconModule } from '@angular/material';
import { RouterModule } from '@angular/router';

import { IgoModule,
         provideIChercheSearchSource,
         provideNominatimSearchSource,
         provideDataSourceSearchSource,
         RouteService,
         provideConfigOptions } from '../../lib';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([]),

    FormsModule,
    HttpModule,
    MdSidenavModule,
    MdCardModule,
    MdIconModule,
    IgoModule.forRoot()
  ],
  providers: [
    provideConfigOptions({
      default: environment.igo,
      path: './config/config.json'
    }),
    RouteService,
    provideNominatimSearchSource(),
    provideIChercheSearchSource(),
    provideDataSourceSearchSource()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
