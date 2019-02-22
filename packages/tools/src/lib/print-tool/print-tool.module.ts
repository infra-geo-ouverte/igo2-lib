import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoPrintModule } from '@igo2/geo';
import { PrintToolComponent } from './print-tool.component';

@NgModule({
  imports: [IgoPrintModule],
  declarations: [PrintToolComponent],
  exports: [PrintToolComponent],
  entryComponents: [PrintToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoPrintToolModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoPrintToolModule,
      providers: []
    };
  }
}
