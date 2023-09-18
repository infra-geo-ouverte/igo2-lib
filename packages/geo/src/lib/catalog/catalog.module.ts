import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  IgoListModule,
  IgoCollapsibleModule,
  IgoMatBadgeIconModule
} from '@igo2/common';

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
  exports: [IgoCatalogBrowserModule, IgoCatalogLibraryModule],
  declarations: []
})
export class IgoCatalogModule {}
