import { NgModule, ModuleWithProviders } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';

import { CollapseDirective } from './collapse.directive';
import { CollapsibleComponent } from './collapsible.component';

@NgModule({
  imports: [MatIconModule, MatListModule],
  declarations: [CollapsibleComponent, CollapseDirective],
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
