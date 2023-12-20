import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  IgoCustomHtmlModule,
  IgoFlexibleModule,
  PanelComponent
} from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';
import {
  IgoFeatureDetailsModule,
  IgoFeatureModule,
  IgoSearchModule
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
    PanelComponent,
    IgoFeatureDetailsModule,
    IgoCustomHtmlModule
  ],
  declarations: [SearchResultsToolComponent],
  exports: [SearchResultsToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppSearchResultsToolModule {}
