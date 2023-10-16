import { ModuleWithProviders, NgModule } from '@angular/core';

import { OverlayDirective } from './shared/overlay.directive';

@NgModule({
  imports: [],
  exports: [OverlayDirective],
  declarations: [OverlayDirective]
})
export class IgoOverlayModule {
  static forRoot(): ModuleWithProviders<IgoOverlayModule> {
    return {
      ngModule: IgoOverlayModule
    };
  }
}
