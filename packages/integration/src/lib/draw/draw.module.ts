import { NgModule } from '@angular/core';

import { IgoAppDrawingToolModule } from './drawing-tool/drawing-tool.module';

/**
 * @deprecated import the DrawingToolComponent directly
 */
@NgModule({
  exports: [IgoAppDrawingToolModule]
})
export class IgoAppDrawModule {}
