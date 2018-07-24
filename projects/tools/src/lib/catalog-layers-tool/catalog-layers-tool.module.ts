import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoCatalogModule } from '@igo2/geo';
import { CatalogLayersToolComponent } from './catalog-layers-tool.component';

@NgModule({
  imports: [IgoCatalogModule],
  declarations: [CatalogLayersToolComponent],
  exports: [CatalogLayersToolComponent],
  entryComponents: [CatalogLayersToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoCatalogLayersToolModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoCatalogLayersToolModule,
      providers: []
    };
  }
}
