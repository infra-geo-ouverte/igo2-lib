import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatTooltipModule,
  MatIconModule,
  MatListModule,
  MatButtonModule,
  MatBadgeModule
} from '@angular/material';

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
