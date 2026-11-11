import { ModuleWithProviders, NgModule } from '@angular/core';

import { FeatureDetailsPanelComponent } from './toast.component';

/**
 * @deprecated import the FeatureDetailsPanelComponent directly
 */
@NgModule({
  imports: [FeatureDetailsPanelComponent],
  exports: [FeatureDetailsPanelComponent]
})
export class IgoToastModule {
  static forRoot(): ModuleWithProviders<IgoToastModule> {
    return {
      ngModule: IgoToastModule
    };
  }
}
