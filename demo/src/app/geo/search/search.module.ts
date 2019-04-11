import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatCardModule,
  MatButtonModule,
  MatIconModule,
  MatTooltipModule
} from '@angular/material';

import { IgoPanelModule } from '@igo2/common';
import {
  IgoMapModule,
  IgoSearchModule,
  provideIChercheSearchSource,
  provideILayerSearchSource,
  provideNominatimSearchSource,
  IgoFeatureModule
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
    IgoPanelModule,
    IgoMapModule,
    IgoSearchModule.forRoot(),
    IgoAppSearchModule,
    IgoFeatureModule
  ],
  exports: [AppSearchComponent],
  providers: [
    provideIChercheSearchSource(),
    provideILayerSearchSource(),
    provideNominatimSearchSource()
  ]
})
export class AppSearchModule {}
