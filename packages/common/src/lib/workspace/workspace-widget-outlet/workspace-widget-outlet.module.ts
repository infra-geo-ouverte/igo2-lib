import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IgoWidgetOutletModule } from '../../widget/widget-outlet/widget-outlet.module';
import { WorkspaceWidgetOutletComponent } from './workspace-widget-outlet.component';

/**
 * @ignore
 */
@NgModule({
  imports: [CommonModule, IgoWidgetOutletModule],
  exports: [WorkspaceWidgetOutletComponent],
  declarations: [WorkspaceWidgetOutletComponent]
})
export class IgoWorkspaceWidgetOutletModule {}
