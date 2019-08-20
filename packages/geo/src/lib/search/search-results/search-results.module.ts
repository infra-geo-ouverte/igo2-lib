import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatTooltipModule,
  MatIconModule,
  MatListModule,
  MatButtonModule
} from '@angular/material';

import {
  IgoCollapsibleModule,
  IgoListModule
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
    MatTooltipModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    IgoCollapsibleModule,
    IgoListModule,
    IgoLanguageModule,
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
