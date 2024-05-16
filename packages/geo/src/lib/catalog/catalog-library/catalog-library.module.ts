import { NgModule } from '@angular/core';

import { AddCatalogDialogComponent } from './add-catalog-dialog.component';
import { CatalogLibaryComponent } from './catalog-library.component';

export const CATALOG_LIBRARY_DIRECTIVES = [
  CatalogLibaryComponent,
  AddCatalogDialogComponent
] as const;

/**
 * @deprecated import the CatalogLibaryComponent, AddCatalogDialogComponent directly
 */
@NgModule({
  imports: [CatalogLibaryComponent, AddCatalogDialogComponent],
  exports: [CatalogLibaryComponent, AddCatalogDialogComponent]
})
export class IgoCatalogLibraryModule {}
