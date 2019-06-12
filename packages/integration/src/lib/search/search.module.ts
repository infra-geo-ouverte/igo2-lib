import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule, MatButtonModule } from '@angular/material';

import { IgoFlexibleModule, IgoPanelModule } from '@igo2/common';
import {
  IgoFeatureModule,
  IgoSearchModule,
  IgoFeatureDetailsModule
} from '@igo2/geo';
import { SearchResultsToolComponent } from './search-results-tool/search-results-tool.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    IgoFeatureModule,
    IgoSearchModule,
    IgoFlexibleModule,
    IgoPanelModule,
    IgoFeatureDetailsModule
  ],
  declarations: [SearchResultsToolComponent],
  exports: [SearchResultsToolComponent],
  entryComponents: [SearchResultsToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppSearchModule {}
