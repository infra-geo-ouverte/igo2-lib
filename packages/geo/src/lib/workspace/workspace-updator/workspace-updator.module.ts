import { NgModule } from '@angular/core';

import { WorkspaceUpdatorDirective } from './workspace-updator.directive';

/**
 * @deprecated import the WorkspaceUpdatorDirective directly
 */
@NgModule({
  imports: [WorkspaceUpdatorDirective],
  exports: [WorkspaceUpdatorDirective]
})
export class IgoWorkspaceUpdatorModule {}
