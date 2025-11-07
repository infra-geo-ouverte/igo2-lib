import { ModuleWithProviders, NgModule } from '@angular/core';

import { BackdropComponent } from './backdrop.component';

/**
 * @deprecated import the BackdropComponent directly
 */
@NgModule({
  imports: [BackdropComponent],
  exports: [BackdropComponent]
})
export class IgoBackdropModule {
  static forRoot(): ModuleWithProviders<IgoBackdropModule> {
    return {
      ngModule: IgoBackdropModule,
      providers: []
    };
  }
}
