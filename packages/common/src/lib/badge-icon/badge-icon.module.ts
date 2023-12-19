import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';

import { IgoBadgeIconDirective } from './badge-icon.directive';

@NgModule({
    imports: [MatBadgeModule, MatIconModule, IgoBadgeIconDirective],
    exports: [MatBadgeModule, IgoBadgeIconDirective]
})
export class IgoMatBadgeIconModule {
  static forRoot(): ModuleWithProviders<IgoMatBadgeIconModule> {
    return {
      ngModule: IgoMatBadgeIconModule,
      providers: []
    };
  }
}
