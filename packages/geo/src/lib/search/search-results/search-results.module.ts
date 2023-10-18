import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  IgoCollapsibleModule,
  IgoListModule,
  IgoMatBadgeIconModule,
  IgoStopPropagationModule
} from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { IgoMetadataModule } from './../../metadata/metadata.module';
import { SaveFeatureDialogComponent } from './save-feature-dialog.component';
import { SearchResultAddButtonComponent } from './search-results-add-button.component';
import { SearchResultsItemComponent } from './search-results-item.component';
import { SearchResultsComponent } from './search-results.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    IgoCollapsibleModule,
    IgoLanguageModule,
    IgoListModule,
    IgoMatBadgeIconModule,
    IgoMetadataModule,
    IgoStopPropagationModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSelectModule,
    MatTabsModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  exports: [SearchResultsComponent, SearchResultAddButtonComponent],
  declarations: [
    SearchResultsComponent,
    SearchResultsItemComponent,
    SearchResultAddButtonComponent,
    SaveFeatureDialogComponent
  ]
})
export class IgoSearchResultsModule {}
