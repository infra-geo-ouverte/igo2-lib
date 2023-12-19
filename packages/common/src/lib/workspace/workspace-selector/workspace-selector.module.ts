import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IgoEntitySelectorModule } from '../../entity/entity-selector/entity-selector.module';
import { WorkspaceSelectorComponent } from './workspace-selector.component';

/**
 * @ignore
 */
@NgModule({
    imports: [CommonModule, IgoEntitySelectorModule, WorkspaceSelectorComponent],
    exports: [WorkspaceSelectorComponent]
})
export class IgoWorkspaceSelectorModule {}
