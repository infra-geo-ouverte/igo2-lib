import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
    MatBadgeModule,
    MatTooltipModule,
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
