import { NgModule } from '@angular/core';

import { ToolboxComponent } from './toolbox.component';

/**
 * @deprecated import the ToolboxComponent directly
 */
@NgModule({
  imports: [ToolboxComponent],
  exports: [ToolboxComponent]
})
export class IgoToolboxModule {}
