import { NgModule, ModuleWithProviders } from '@angular/core';
import { MatIconModule, MatListModule } from '@angular/material';

import { CollapseDirective } from './collapse.directive';
import { CollapsibleComponent } from './collapsible.component';

@NgModule({
  imports: [MatIconModule, MatListModule],
  declarations: [CollapsibleComponent, CollapseDirective],
  exports: [CollapsibleComponent, CollapseDirective]
})
export class IgoCollapsibleModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoCollapsibleModule,
      providers: []
    };
  }
}
