import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { IgoDrawingToolModule } from '@igo2/geo';

import { DrawingToolComponent } from './drawing-tool.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    IgoDrawingToolModule
  ],
  declarations: [DrawingToolComponent],
  exports: [DrawingToolComponent],
  entryComponents: [DrawingToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppDrawingToolModule {}
