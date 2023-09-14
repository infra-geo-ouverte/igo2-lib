import { NgModule } from '@angular/core';

import { IgoDrawingToolModule } from '@igo2/geo';
import { IgoAppDrawingToolModule } from './drawing-tool/drawing-tool.module';

@NgModule({
  imports: [IgoDrawingToolModule],
  exports: [
    IgoAppDrawingToolModule
  ]
})
export class IgoAppDrawModule {}
