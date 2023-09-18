import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { IgoCatalogLibraryModule } from '@igo2/geo';
import { CatalogLibraryToolComponent } from './catalog-library-tool.component';

/**
 * @ignore
 */
@NgModule({
  imports: [CommonModule, IgoCatalogLibraryModule],
  declarations: [CatalogLibraryToolComponent],
  exports: [CatalogLibraryToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppCatalogLibraryToolModule {}
