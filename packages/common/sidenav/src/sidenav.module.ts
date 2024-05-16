import { ModuleWithProviders, NgModule } from '@angular/core';

import { SidenavShimDirective } from './sidenav-shim.directive';

/**
 * @deprecated import the SidenavShimDirective directly
 */
@NgModule({
  imports: [SidenavShimDirective],
  exports: [SidenavShimDirective]
})
export class IgoSidenavModule {
  static forRoot(): ModuleWithProviders<IgoSidenavModule> {
    return {
      ngModule: IgoSidenavModule,
      providers: []
    };
  }
}
