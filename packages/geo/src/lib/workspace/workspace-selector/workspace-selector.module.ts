import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { WorkspaceSelectorDirective } from './workspace-selector.directive';

/**
 * @ignore
 */
@NgModule({
    imports: [CommonModule, WorkspaceSelectorDirective],
    exports: [WorkspaceSelectorDirective]
})
export class IgoWorkspaceSelectorModule {}
