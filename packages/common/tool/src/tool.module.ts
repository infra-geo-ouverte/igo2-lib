import { ModuleWithProviders, NgModule } from '@angular/core';

import { ToolService } from './shared/tool.service';
import { IgoToolboxModule } from './toolbox/toolbox.module';

/**
 * @deprecated import the ToolboxComponent directly
 */
@NgModule({
  exports: [IgoToolboxModule]
})
export class IgoToolModule {
  /**
   * @deprecated it has no effect
   */
  static forRoot(): ModuleWithProviders<IgoToolModule> {
    return {
      ngModule: IgoToolModule,
      providers: [ToolService]
    };
  }
}
