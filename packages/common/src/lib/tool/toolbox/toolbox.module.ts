import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IgoActionModule } from '../../action/action.module';
import { IgoDynamicComponentModule } from '../../dynamic-component/dynamic-component.module';
import { ToolboxComponent } from './toolbox.component';

/**
 * @ignore
 */
@NgModule({
  imports: [CommonModule, IgoActionModule, IgoDynamicComponentModule],
  exports: [ToolboxComponent],
  declarations: [ToolboxComponent]
})
export class IgoToolboxModule {}
