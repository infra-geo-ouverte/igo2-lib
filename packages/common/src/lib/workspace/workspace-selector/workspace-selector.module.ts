import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoEntitySelectorModule } from '../../entity/entity-selector/entity-selector.module';
import { WorkspaceSelectorComponent } from './workspace-selector.component';

/**
 * @ignore
 */
@NgModule({
  imports: [CommonModule, IgoEntitySelectorModule],
  exports: [WorkspaceSelectorComponent],
  declarations: [WorkspaceSelectorComponent]
})
export class IgoWorkspaceSelectorModule {}
