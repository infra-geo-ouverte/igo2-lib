import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { WorkspaceUpdatorDirective } from './workspace-updator.directive';

/**
 * @ignore
 */
@NgModule({
  imports: [CommonModule],
  exports: [WorkspaceUpdatorDirective],
  declarations: [WorkspaceUpdatorDirective]
})
export class IgoWorkspaceUpdatorModule {}
