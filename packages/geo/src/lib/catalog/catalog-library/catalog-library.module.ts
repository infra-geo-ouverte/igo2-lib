import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoListModule, IgoMatBadgeIconModule } from '@igo2/common';

import { CatalogLibaryComponent, } from './catalog-library.component';
import { CatalogLibaryItemComponent } from './catalog-library-item.component';
import { MatBadgeModule } from '@angular/material/badge';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatBadgeModule,
    IgoMatBadgeIconModule,
    MatListModule,
    MatTooltipModule,
    IgoListModule
  ],
  exports: [
    CatalogLibaryComponent
  ],
  declarations: [
    CatalogLibaryComponent,
    CatalogLibaryItemComponent
  ]
})
export class IgoCatalogLibraryModule {}
