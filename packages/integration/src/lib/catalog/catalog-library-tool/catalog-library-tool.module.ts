import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { IgoCatalogLibraryModule } from '@igo2/geo';

import { CatalogLibraryToolComponent } from './catalog-library-tool.component';

/**
 * @ignore
 */
@NgModule({
    imports: [CommonModule, IgoCatalogLibraryModule, CatalogLibraryToolComponent],
    exports: [CatalogLibraryToolComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppCatalogLibraryToolModule {}
