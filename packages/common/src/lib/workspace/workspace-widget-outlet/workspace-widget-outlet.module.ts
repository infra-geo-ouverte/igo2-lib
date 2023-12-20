import { NgModule } from '@angular/core';

import { WorkspaceWidgetOutletComponent } from './workspace-widget-outlet.component';

/**
 * @deprecated import the WorkspaceWidgetOutletComponent directly
 */
@NgModule({
  imports: [WorkspaceWidgetOutletComponent],
  exports: [WorkspaceWidgetOutletComponent]
})
export class IgoWorkspaceWidgetOutletModule {}
