import { NgModule } from '@angular/core';

import { DrawingToolComponent } from './drawing-tool.component';

/**
 * @deprecated import the DrawingToolComponent directly
 */
@NgModule({
  imports: [DrawingToolComponent],
  exports: [DrawingToolComponent]
})
export class IgoAppDrawingToolModule {}
