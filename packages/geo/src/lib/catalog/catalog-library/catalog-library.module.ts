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
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoListModule } from '@igo2/common';
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
        MatButtonModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatDialogModule,
        CatalogLibaryComponent,
        CatalogLibaryItemComponent,
        AddCatalogDialogComponent
    ],
    exports: [CatalogLibaryComponent, AddCatalogDialogComponent]
})
export class IgoCatalogLibraryModule {}
