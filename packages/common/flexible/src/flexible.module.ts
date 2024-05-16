import { ModuleWithProviders, NgModule } from '@angular/core';

import { FlexibleComponent } from './flexible.component';

/**
 * @deprecated import the FlexibleComponent directly
 */
@NgModule({
  imports: [FlexibleComponent],
  exports: [FlexibleComponent]
})
export class IgoFlexibleModule {
  static forRoot(): ModuleWithProviders<IgoFlexibleModule> {
    return {
      ngModule: IgoFlexibleModule,
      providers: []
    };
  }
}
