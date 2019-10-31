import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoFilterModule } from '@igo2/geo';
import { OgcFilterToolComponent } from './ogc-filter-tool/ogc-filter-tool.component';
import { TimeFilterToolComponent } from './time-filter-tool/time-filter-tool.component';

@NgModule({
  imports: [IgoFilterModule],
  declarations: [OgcFilterToolComponent, TimeFilterToolComponent],
  exports: [OgcFilterToolComponent, TimeFilterToolComponent],
  entryComponents: [OgcFilterToolComponent, TimeFilterToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppFilterModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoAppFilterModule,
      providers: []
    };
  }
}
