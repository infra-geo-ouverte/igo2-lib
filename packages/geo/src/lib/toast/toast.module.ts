import { ModuleWithProviders, NgModule } from '@angular/core';

import { ToastComponent } from './toast.component';

/**
 * @deprecated import the ToastComponent directly
 */
@NgModule({
  imports: [ToastComponent],
  exports: [ToastComponent]
})
export class IgoToastModule {
  static forRoot(): ModuleWithProviders<IgoToastModule> {
    return {
      ngModule: IgoToastModule
    };
  }
}
