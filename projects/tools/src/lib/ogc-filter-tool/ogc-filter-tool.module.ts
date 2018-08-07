import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoFilterModule } from '@igo2/geo';
import { OgcFilterToolComponent } from './ogc-filter-tool.component';

@NgModule({
  imports: [IgoFilterModule],
  declarations: [OgcFilterToolComponent],
  exports: [OgcFilterToolComponent],
  entryComponents: [OgcFilterToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoOgcFilterToolModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoOgcFilterToolModule,
      providers: []
    };
  }
}
