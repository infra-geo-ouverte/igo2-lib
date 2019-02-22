import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoCatalogModule } from '@igo2/geo';
import { CatalogToolComponent } from './catalog-tool.component';

@NgModule({
  imports: [IgoCatalogModule],
  declarations: [CatalogToolComponent],
  exports: [CatalogToolComponent],
  entryComponents: [CatalogToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoCatalogToolModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoCatalogToolModule,
      providers: []
    };
  }
}
