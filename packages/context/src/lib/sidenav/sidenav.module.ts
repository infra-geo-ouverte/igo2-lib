import { ModuleWithProviders, NgModule } from '@angular/core';

import { SidenavComponent } from './sidenav.component';

/**
 * @deprecated import the SidenavComponent directly
 */
@NgModule({
  imports: [SidenavComponent],
  exports: [SidenavComponent]
})
export class IgoSidenavModule {
  static forRoot(): ModuleWithProviders<IgoSidenavModule> {
    return {
      ngModule: IgoSidenavModule
    };
  }
}
