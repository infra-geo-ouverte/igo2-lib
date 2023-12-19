import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { CollapseDirective } from './collapse.directive';
import { CollapsibleComponent } from './collapsible.component';

@NgModule({
    imports: [MatIconModule, MatListModule, CollapsibleComponent, CollapseDirective],
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
