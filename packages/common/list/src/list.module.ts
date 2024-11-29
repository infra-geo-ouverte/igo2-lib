import { ModuleWithProviders, NgModule } from '@angular/core';

import { ListItemDirective } from './list-item.directive';
import { ListComponent } from './list.component';

/**
 * @deprecated import the components/directives directly or LIST_DIRECTIVES for the set
 */
@NgModule({
  imports: [ListItemDirective, ListComponent],
  exports: [ListItemDirective, ListComponent]
})
export class IgoListModule {
  static forRoot(): ModuleWithProviders<IgoListModule> {
    return {
      ngModule: IgoListModule,
      providers: []
    };
  }
}
