import { NgModule } from '@angular/core';

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
  provideCadastreSearchSource,
  provideStoredQueriesSearchSource,
  provideStoredQueriesReverseSearchSource
} from '@igo2/geo';

import { IgoAppSearchModule } from '@igo2/integration';

import { AppSearchComponent } from './search.component';
import { AppSearchRoutingModule } from './search-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppSearchComponent],
  imports: [
    SharedModule,
    AppSearchRoutingModule,
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
    provideWorkspaceSearchSource(),
    provideILayerSearchSource(),
    provideNominatimSearchSource(),
    provideIChercheReverseSearchSource(),
    provideStoredQueriesSearchSource(),
    provideStoredQueriesReverseSearchSource()
  ]
})
export class AppSearchModule {}
