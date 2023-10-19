import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { IgoCatalogLibraryModule } from '@igo2/geo';

import { CatalogLibraryToolComponent } from './catalog-library-tool.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IgoLanguageModule } from '@igo2/core';
import { MatButtonModule } from '@angular/material/button';
import { IgoListModule } from '@igo2/common';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    IgoCatalogLibraryModule,
    MatButtonModule,
    MatTooltipModule,
    IgoListModule,
    IgoLanguageModule
  ],
  declarations: [CatalogLibraryToolComponent],
  exports: [CatalogLibraryToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppCatalogLibraryToolModule {}
