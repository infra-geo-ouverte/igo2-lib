import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { IgoListModule, IgoCollapsibleModule, IgoMatBadgeIconModule } from '@igo2/common';

import { IgoCatalogBrowserModule } from './catalog-browser/catalog-browser.module';
import { IgoCatalogLibraryModule } from './catalog-library/catalog-library.module';

@NgModule({
  imports: [
    CommonModule,
    MatBadgeModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    IgoMatBadgeIconModule,
    IgoListModule,
    IgoCollapsibleModule
  ],
  exports: [
    IgoCatalogBrowserModule,
    IgoCatalogLibraryModule
  ],
  declarations: []
})
export class IgoCatalogModule {}
