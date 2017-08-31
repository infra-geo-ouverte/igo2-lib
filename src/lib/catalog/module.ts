import { NgModule, ModuleWithProviders } from '@angular/core';

import { IgoSharedModule } from '../shared';

import { CatalogService } from './shared';
import { CatalogItemComponent } from './catalog-item';
import { CatalogLayersListComponent,
         CatalogLayersListBindingDirective } from './catalog-layers-list';
import { CatalogListComponent,
         CatalogListBindingDirective } from './catalog-list';
import { CatalogLayerItemComponent } from './catalog-layer-item';


@NgModule({
  imports: [
    IgoSharedModule
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
      ngModule: IgoCatalogModule,
      providers: [
        CatalogService
      ]
    };
  }
}
