import { NgModule } from '@angular/core';

import { WorkspaceSelectorComponent } from './workspace-selector.component';

/**
 * @deprecated import the WorkspaceSelectorComponent directly
 */
@NgModule({
  imports: [WorkspaceSelectorComponent],
  exports: [WorkspaceSelectorComponent]
})
export class IgoWorkspaceSelectorModule {}
