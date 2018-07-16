import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatIconModule,
  MatListModule,
  MatTooltipModule
} from '@angular/material';

import { IgoListModule, IgoCollapsibleModule } from '@igo2/common';

import { CatalogItemComponent } from './catalog-item/catalog-item.component';
import { CatalogLayersListComponent } from './catalog-layers-list/catalog-layers-list.component';
import { CatalogListComponent } from './catalog-list/catalog-list.component';
import { CatalogLayersListBindingDirective } from './catalog-layers-list/catalog-layers-list-binding.directive';
import { CatalogListBindingDirective } from './catalog-list/catalog-list-binding.directive';
import { CatalogLayerItemComponent } from './catalog-layer-item/catalog-layer-item.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    IgoListModule,
    IgoCollapsibleModule
  ],
  exports: [
    CatalogListComponent,
    CatalogListBindingDirective,
    CatalogItemComponent,
    CatalogLayersListComponent,
    CatalogLayersListBindingDirective,
    CatalogLayerItemComponent
  ],
  declarations: [
    CatalogListComponent,
    CatalogListBindingDirective,
    CatalogItemComponent,
    CatalogLayersListComponent,
    CatalogLayersListBindingDirective,
    CatalogLayerItemComponent
  ]
})
export class IgoCatalogModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoCatalogModule
    };
  }
}
