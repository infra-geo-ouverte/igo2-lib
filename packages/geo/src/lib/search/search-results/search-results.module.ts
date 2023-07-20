import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';

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
import { SaveFeatureDialogComponent } from './save-feature-dialog.component';

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
    MatDialogModule,
    IgoCollapsibleModule,
    IgoListModule,
    IgoStopPropagationModule,
    IgoLanguageModule,
    IgoMatBadgeIconModule,
    IgoMetadataModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
  ],
  exports: [
    SearchResultsComponent,
    SearchResultAddButtonComponent
  ],
  declarations: [
    SearchResultsComponent,
    SearchResultsItemComponent,
    SearchResultAddButtonComponent,
    SaveFeatureDialogComponent
  ]
})
export class IgoSearchResultsModule {}
