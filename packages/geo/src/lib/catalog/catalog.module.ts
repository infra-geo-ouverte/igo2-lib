import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatIconModule,
  MatListModule,
  MatTooltipModule,
  MatBadgeModule
} from '@angular/material';

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
