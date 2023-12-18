import { NgModule } from '@angular/core';

import {
  IgoActionbarModule,
  IgoContextMenuModule,
  IgoPanelModule
} from '@igo2/common';
import { IgoMessageModule } from '@igo2/core';
import {
  IgoFeatureModule,
  IgoMapModule,
  IgoSearchModule,
  provideCadastreSearchSource,
  provideCoordinatesReverseSearchSource,
  provideIChercheReverseSearchSource,
  provideIChercheSearchSource,
  provideILayerSearchSource,
  provideNominatimSearchSource,
  provideStoredQueriesReverseSearchSource,
  provideStoredQueriesSearchSource,
  provideWorkspaceSearchSource
} from '@igo2/geo';
import { IgoAppSearchModule } from '@igo2/integration';


import { AppSearchRoutingModule } from './search-routing.module';
import { AppSearchComponent } from './search.component';

@NgModule({
  imports: [
    AppSearchRoutingModule,
    IgoMessageModule.forRoot(),
    IgoPanelModule,
    IgoMapModule,
    IgoSearchModule.forRoot(),
    IgoAppSearchModule,
    IgoActionbarModule,
    IgoContextMenuModule,
    IgoFeatureModule,
    AppSearchComponent
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
