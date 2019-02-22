import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoFilterModule } from '@igo2/geo';
import { OgcFilterToolComponent } from './ogc-filter-tool/ogc-filter-tool.component';
import { TimeAnalysisToolComponent } from './time-analysis-tool/time-analysis-tool.component';

@NgModule({
  imports: [IgoFilterModule],
  declarations: [OgcFilterToolComponent, TimeAnalysisToolComponent],
  exports: [OgcFilterToolComponent, TimeAnalysisToolComponent],
  entryComponents: [OgcFilterToolComponent, TimeAnalysisToolComponent],
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
