import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

import {
  IgoCollapsibleModule,
  IgoListModule,
  IgoMatBadgeIconModule,
  IgoStopPropagationModule
} from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { IgoMetadataModule } from './../../metadata/metadata.module';
import { SearchResultsComponent } from './search-results.component';
import { SearchResultsItemComponent } from './search-results-item.component';
import { SearchResultAddButtonComponent } from './search-results-add-button.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatBadgeModule,
    MatTooltipModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatTabsModule,
    IgoCollapsibleModule,
    IgoListModule,
    IgoStopPropagationModule,
    IgoLanguageModule,
    IgoMatBadgeIconModule,
    IgoMetadataModule,
  ],
  exports: [
    SearchResultsComponent,
    SearchResultAddButtonComponent
  ],
  declarations: [
    SearchResultsComponent,
    SearchResultsItemComponent,
    SearchResultAddButtonComponent
  ]
})
export class IgoSearchResultsModule {}
