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

import { SharedModule } from '../../shared/shared.module';
import { AppSearchRoutingModule } from './search-routing.module';
import { AppSearchComponent } from './search.component';

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
