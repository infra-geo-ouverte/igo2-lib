import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { WorkspaceSelectorDirective } from './workspace-selector.directive';

/**
 * @ignore
 */
@NgModule({
  imports: [CommonModule],
  exports: [WorkspaceSelectorDirective],
  declarations: [WorkspaceSelectorDirective]
})
export class IgoWorkspaceSelectorModule {}
