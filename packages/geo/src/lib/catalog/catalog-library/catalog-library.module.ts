import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { IgoListModule } from '@igo2/common';

import { CatalogLibaryComponent, } from './catalog-library.component';
import { CatalogLibaryItemComponent } from './catalog-library-item.component';
import { AddCatalogDialogComponent } from './add-catalog-dialog.component';

import { MatBadgeModule } from '@angular/material/badge';
import { IgoLanguageModule } from '@igo2/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatBadgeModule,
    MatListModule,
    MatTooltipModule,
    IgoListModule,
    IgoLanguageModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDialogModule
  ],
  exports: [
    CatalogLibaryComponent,
    AddCatalogDialogComponent
  ],
  declarations: [
    CatalogLibaryComponent,
    CatalogLibaryItemComponent,
    AddCatalogDialogComponent
  ]
})
export class IgoCatalogLibraryModule {}
