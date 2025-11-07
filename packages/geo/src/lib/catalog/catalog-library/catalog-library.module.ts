import { NgModule } from '@angular/core';

import { AddCatalogDialogComponent } from './add-catalog-dialog.component';
import { CatalogLibraryComponent } from './catalog-library.component';

export const CATALOG_LIBRARY_DIRECTIVES = [
  CatalogLibraryComponent,
  AddCatalogDialogComponent
] as const;

/**
 * @deprecated import the CatalogLibraryComponent, AddCatalogDialogComponent directly
 */
@NgModule({
  imports: [CatalogLibraryComponent, AddCatalogDialogComponent],
  exports: [CatalogLibraryComponent, AddCatalogDialogComponent]
})
export class IgoCatalogLibraryModule {}
