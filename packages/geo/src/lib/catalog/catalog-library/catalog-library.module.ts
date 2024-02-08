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

import { IgoFormModule, IgoListModule } from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { AddCatalogDialogComponent } from './add-catalog-dialog.component';
import { CatalogLibaryItemComponent } from './catalog-library-item.component';
import { CatalogLibaryComponent } from './catalog-library.component';

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
    MatTabsModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDialogModule,
    IgoFormModule
  ],
  exports: [CatalogLibaryComponent, AddCatalogDialogComponent],
  declarations: [
    CatalogLibaryComponent,
    CatalogLibaryItemComponent,
    AddCatalogDialogComponent
  ]
})
export class IgoCatalogLibraryModule {}
