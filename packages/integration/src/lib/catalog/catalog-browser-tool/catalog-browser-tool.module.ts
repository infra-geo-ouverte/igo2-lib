import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { IgoCatalogBrowserModule } from '@igo2/geo';
import { CatalogBrowserToolComponent } from './catalog-browser-tool.component';

/**
 * @ignore
 */
@NgModule({
  imports: [CommonModule, IgoCatalogBrowserModule],
  declarations: [CatalogBrowserToolComponent],
  exports: [CatalogBrowserToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppCatalogBrowserToolModule {}
