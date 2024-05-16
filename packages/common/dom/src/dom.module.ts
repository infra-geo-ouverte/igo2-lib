import { ModuleWithProviders, NgModule } from '@angular/core';

import { DOMService } from './dom.service';

/**
 * @deprecated it has no effect
 */

@NgModule({
  providers: [DOMService]
})
export class IgoDOMModule {
  /**
   * @deprecated it has no effect
   */
  static forRoot(): ModuleWithProviders<IgoDOMModule> {
    return {
      ngModule: IgoDOMModule,
      providers: [DOMService]
    };
  }
}
