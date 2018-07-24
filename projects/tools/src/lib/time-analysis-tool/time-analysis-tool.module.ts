import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoFilterModule } from '@igo2/geo';
import { TimeAnalysisToolComponent } from './time-analysis-tool.component';

@NgModule({
  imports: [IgoFilterModule],
  declarations: [TimeAnalysisToolComponent],
  exports: [TimeAnalysisToolComponent],
  entryComponents: [TimeAnalysisToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoTimeAnalysisToolModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoTimeAnalysisToolModule,
      providers: []
    };
  }
}
