import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFlexibleModule, IgoCustomHtmlModule, IgoPanelModule } from '@igo2/common';
import {
  IgoFeatureModule,
  IgoSearchModule,
  IgoFeatureDetailsModule
} from '@igo2/geo';

import { SearchResultsToolComponent } from './search-results-tool.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    IgoLanguageModule,
    IgoFeatureModule,
    IgoSearchModule,
    IgoFlexibleModule,
    IgoPanelModule,
    IgoFeatureDetailsModule,
    IgoCustomHtmlModule
  ],
  declarations: [SearchResultsToolComponent],
  exports: [SearchResultsToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppSearchResultsToolModule {}
