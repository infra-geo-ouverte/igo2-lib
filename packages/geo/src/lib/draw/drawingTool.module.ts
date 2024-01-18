import { NgModule } from '@angular/core';

import { IgoDrawModule } from './draw/draw.module';

/**
 * @deprecated import the DrawComponent directly
 */
@NgModule({
  exports: [IgoDrawModule]
})
export class IgoDrawingToolModule {}
