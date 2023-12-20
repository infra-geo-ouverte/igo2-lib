import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { WorkspaceUpdatorDirective } from './workspace-updator.directive';

/**
 * @ignore
 */
@NgModule({
    imports: [CommonModule, WorkspaceUpdatorDirective],
    exports: [WorkspaceUpdatorDirective]
})
export class IgoWorkspaceUpdatorModule {}
