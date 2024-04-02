import { AddCatalogDialogComponent } from './add-catalog-dialog.component';
import { CatalogLibaryComponent } from './catalog-library.component';

export * from './add-catalog-dialog.component';
export * from './catalog-library.component';

export const CATALOG_LIBRARY_DIRECTIVES = [
  CatalogLibaryComponent,
  AddCatalogDialogComponent
] as const;
