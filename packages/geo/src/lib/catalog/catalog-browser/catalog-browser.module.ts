import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatTooltipModule,
  MatBadgeModule,
  MatButtonModule,
  MatIconModule,
  MatListModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import {
  IgoMatBadgeIconModule,
  IgoCollapsibleModule,
  IgoListModule
} from '@igo2/common';

import { IgoMetadataModule } from './../../metadata/metadata.module';
import { CatalogBrowserComponent } from './catalog-browser.component';
import { CatalogBrowserLayerComponent } from './catalog-browser-layer.component';
import { CatalogBrowserGroupComponent } from './catalog-browser-group.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    IgoMatBadgeIconModule,
    IgoLanguageModule,
    IgoListModule,
    IgoCollapsibleModule,
    IgoMetadataModule
  ],
  exports: [
    CatalogBrowserComponent
  ],
  declarations: [
    CatalogBrowserComponent,
    CatalogBrowserGroupComponent,
    CatalogBrowserLayerComponent
  ]
})
export class IgoCatalogBrowserModule {}
