import { ModuleWithProviders, NgModule } from '@angular/core';

import { PrintToolComponent } from './print-tool/print-tool.component';

/**
 * @deprecated import the PrintToolComponent directly
 */
@NgModule({
  imports: [PrintToolComponent],
  exports: [PrintToolComponent]
})
export class IgoAppPrintModule {
  static forRoot(): ModuleWithProviders<IgoAppPrintModule> {
    return {
      ngModule: IgoAppPrintModule,
      providers: []
    };
  }
}
