import { NgModule } from '@angular/core';

import { IgoDrawingToolModule } from '@igo2/geo';
import { DrawingToolComponent } from './drawing-tool/drawing-tool.component';

@NgModule({
  imports: [IgoDrawingToolModule],
  declarations: [DrawingToolComponent],
  exports: [
    DrawingToolComponent
  ]
})
export class IgoAppDrawModule {}
