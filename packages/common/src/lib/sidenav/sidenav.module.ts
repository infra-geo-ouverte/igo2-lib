import { ModuleWithProviders, NgModule } from '@angular/core';

import { SidenavShimDirective } from './sidenav-shim.directive';

@NgModule({
  imports: [],
  declarations: [SidenavShimDirective],
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
