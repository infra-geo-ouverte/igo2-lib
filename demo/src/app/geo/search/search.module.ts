import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
  provideWorkspaceSearchSource,
  provideILayerSearchSource,
  provideNominatimSearchSource,
  provideIChercheReverseSearchSource,
  provideCoordinatesReverseSearchSource,
  provideStoredQueriesSearchSource,
  provideStoredQueriesReverseSearchSource
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
    provideIChercheSearchSource(),
    provideWorkspaceSearchSource(),
    provideILayerSearchSource(),
    provideNominatimSearchSource(),
    provideIChercheReverseSearchSource(),
    provideStoredQueriesSearchSource(),
    provideStoredQueriesReverseSearchSource()
  ]
})
export class AppSearchModule {}
