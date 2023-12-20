import { ModuleWithProviders, NgModule } from '@angular/core';

import { OverlayDirective } from './shared/overlay.directive';

@NgModule({
    imports: [OverlayDirective],
    exports: [OverlayDirective]
})
export class IgoOverlayModule {
  static forRoot(): ModuleWithProviders<IgoOverlayModule> {
    return {
      ngModule: IgoOverlayModule
    };
  }
}
