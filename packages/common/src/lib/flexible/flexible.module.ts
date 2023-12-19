import { ModuleWithProviders, NgModule } from '@angular/core';

import { FlexibleComponent } from './flexible.component';

@NgModule({
  imports: [],
  declarations: [FlexibleComponent],
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
