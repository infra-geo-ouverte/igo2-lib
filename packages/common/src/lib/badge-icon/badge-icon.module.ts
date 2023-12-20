import { ModuleWithProviders, NgModule } from '@angular/core';

import { IgoBadgeIconDirective } from './badge-icon.directive';

/**
 * @deprecated import the IgoBadgeIconDirective directly
 */
@NgModule({
  imports: [IgoBadgeIconDirective],
  exports: [IgoBadgeIconDirective]
})
export class IgoMatBadgeIconModule {
  static forRoot(): ModuleWithProviders<IgoMatBadgeIconModule> {
    return {
      ngModule: IgoMatBadgeIconModule,
      providers: []
    };
  }
}
