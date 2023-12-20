import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { IgoCatalogBrowserModule } from '@igo2/geo';

import { CatalogBrowserToolComponent } from './catalog-browser-tool.component';

/**
 * @ignore
 */
@NgModule({
    imports: [CommonModule, IgoCatalogBrowserModule, CatalogBrowserToolComponent],
    exports: [CatalogBrowserToolComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppCatalogBrowserToolModule {}
