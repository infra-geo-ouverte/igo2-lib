import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  IgoCollapsibleModule,
  IgoListModule,
  IgoMatBadgeIconModule
} from '@igo2/common';
import { IgoLanguageModule } from '@igo2/core';

import { IgoLayerModule } from '../../layer/layer.module';
import { IgoMetadataModule } from './../../metadata/metadata.module';
import { CatalogBrowserGroupComponent } from './catalog-browser-group.component';
import { CatalogBrowserLayerComponent } from './catalog-browser-layer.component';
import { CatalogBrowserComponent } from './catalog-browser.component';

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
    IgoMetadataModule,
    IgoLayerModule
  ],
  exports: [CatalogBrowserComponent],
  declarations: [
    CatalogBrowserComponent,
    CatalogBrowserGroupComponent,
    CatalogBrowserLayerComponent
  ]
})
export class IgoCatalogBrowserModule {}
