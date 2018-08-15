import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import {
  MatCardModule,
  MatButtonModule,
  MatIconModule,
  MatTooltipModule
} from '@angular/material';

import { ConfigService, LanguageService } from '@igo2/core';
import { IgoPanelModule } from '@igo2/common';
import {
  IgoMapModule,
  IgoSearchModule,
  IgoFeatureModule,
  IgoOverlayModule,
  provideIChercheSearchSource,
  provideDataSourceSearchSource
} from '@igo2/geo';

import { AppSearchComponent } from './search.component';
import { AppSearchRoutingModule } from './search-routing.module';

@NgModule({
  declarations: [AppSearchComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    AppSearchRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    IgoPanelModule,
    IgoMapModule,
    IgoSearchModule,
    IgoFeatureModule,
    IgoOverlayModule
  ],
  exports: [AppSearchComponent],
  providers: [provideIChercheSearchSource(), provideDataSourceSearchSource()]
})
export class AppSearchModule {}
