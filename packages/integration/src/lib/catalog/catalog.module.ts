import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoCatalogModule } from '@igo2/geo';
import { CatalogToolComponent } from './catalog-tool/catalog-tool.component';
import { CatalogLayersToolComponent } from './catalog-layers-tool/catalog-layers-tool.component';

@NgModule({
  imports: [IgoCatalogModule],
  declarations: [CatalogToolComponent, CatalogLayersToolComponent],
  exports: [CatalogToolComponent, CatalogLayersToolComponent],
  entryComponents: [CatalogToolComponent, CatalogLayersToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppCatalogModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoCatalogModule,
      providers: []
    };
  }
}
