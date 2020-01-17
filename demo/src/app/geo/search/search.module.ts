import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatCardModule,
  MatButtonModule,
  MatIconModule,
  MatTooltipModule
} from '@angular/material';

import { IgoMessageModule } from '@igo2/core';

import {
  IgoPanelModule,
  IgoActionbarModule,
  IgoContextMenuModule
} from '@igo2/common';

import {
  IgoFeatureModule,
  IgoMapModule,
  IgoSearchModule,
  provideIChercheSearchSource,
  provideILayerSearchSource,
  provideNominatimSearchSource,
  provideIChercheReverseSearchSource,
  provideCoordinatesReverseSearchSource,
  provideCadastreSearchSource
} from '@igo2/geo';

import { IgoAppSearchModule } from '@igo2/integration';

import { AppSearchComponent } from './search.component';
import { AppSearchRoutingModule } from './search-routing.module';

@NgModule({
  declarations: [AppSearchComponent],
  imports: [
    CommonModule,
    AppSearchRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    IgoMessageModule.forRoot(),
    IgoPanelModule,
    IgoMapModule,
    IgoSearchModule.forRoot(),
    IgoAppSearchModule,
    IgoActionbarModule,
    IgoContextMenuModule,
    IgoFeatureModule
  ],
  exports: [AppSearchComponent],
  providers: [
    provideCoordinatesReverseSearchSource(),
    provideCadastreSearchSource(),
    provideIChercheSearchSource(),
    provideILayerSearchSource(),
    provideNominatimSearchSource(),
    provideIChercheReverseSearchSource()
  ]
})
export class AppSearchModule {}
