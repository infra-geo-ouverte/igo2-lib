import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CollapseDirective } from './collapse.directive';
import { CollapsibleComponent } from './collapsible.component';

@NgModule({
  imports: [
    CommonModule, 
    MatIconModule, 
    MatListModule, 
    MatButtonModule, 
    MatTooltipModule
  ],
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
