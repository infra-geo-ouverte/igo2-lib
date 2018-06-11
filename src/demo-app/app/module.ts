import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatSidenavModule, MatCardModule, MatIconModule } from '@angular/material';
import { RouterModule } from '@angular/router';

import { IgoModule,
         provideIChercheSearchSource,
         provideNominatimSearchSource,
         provideDataSourceSearchSource,
         RouteService,
         provideConfigOptions,
         provideOsrmRoutingSource } from '../../lib';

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
    HttpClientModule,
    MatSidenavModule,
    MatCardModule,
    MatIconModule,
    IgoModule.forRoot()
  ],
  providers: [
    provideConfigOptions({
      default: environment.igo,
      path: './config/config.json'
    }),
    provideOsrmRoutingSource(),
    RouteService,
    provideNominatimSearchSource(),
    provideIChercheSearchSource(),
    provideDataSourceSearchSource()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
