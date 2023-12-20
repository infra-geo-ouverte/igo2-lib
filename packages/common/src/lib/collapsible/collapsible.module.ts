import { ModuleWithProviders, NgModule } from '@angular/core';

import { CollapseDirective } from './collapse.directive';
import { CollapsibleComponent } from './collapsible.component';

/**
 * @deprecated import the components/directives directly or COLLAPSIBLE_DIRECTIVES for the set
 */
@NgModule({
  imports: [CollapsibleComponent, CollapseDirective],
  exports: [CollapsibleComponent, CollapseDirective]
})
export class IgoCollapsibleModule {
  static forRoot(): ModuleWithProviders<IgoCollapsibleModule> {
    return {
      ngModule: IgoCollapsibleModule,
      providers: []
    };
  }
}
