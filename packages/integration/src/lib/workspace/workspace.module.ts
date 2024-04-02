import { NgModule } from '@angular/core';

import { WorkspaceButtonComponent } from './workspace-button/workspace-button.component';

/**
 * @deprecated import the WorkspaceButtonComponent directly
 */
@NgModule({
  imports: [WorkspaceButtonComponent],
  exports: [WorkspaceButtonComponent]
})
export class IgoAppWorkspaceModule {}
