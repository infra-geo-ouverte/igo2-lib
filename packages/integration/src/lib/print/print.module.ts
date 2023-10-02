import {
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders,
  NgModule
} from '@angular/core';

import { IgoPrintModule } from '@igo2/geo';

import { PrintToolComponent } from './print-tool/print-tool.component';

@NgModule({
  imports: [IgoPrintModule],
  declarations: [PrintToolComponent],
  exports: [PrintToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppPrintModule {
  static forRoot(): ModuleWithProviders<IgoAppPrintModule> {
    return {
      ngModule: IgoAppPrintModule,
      providers: []
    };
  }
}
