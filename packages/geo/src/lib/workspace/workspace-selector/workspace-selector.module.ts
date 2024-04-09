import { NgModule } from '@angular/core';

import { WorkspaceSelectorDirective } from './workspace-selector.directive';

/**
 * @deprecated import the WorkspaceSelectorDirective directly
 */
@NgModule({
  imports: [WorkspaceSelectorDirective],
  exports: [WorkspaceSelectorDirective]
})
export class IgoWorkspaceSelectorModule {}
