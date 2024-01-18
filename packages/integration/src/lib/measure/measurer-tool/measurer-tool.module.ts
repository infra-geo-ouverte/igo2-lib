import { NgModule } from '@angular/core';

import { MeasurerToolComponent } from './measurer-tool.component';

/**
 * @deprecated import the MeasurerToolComponent directly
 */
@NgModule({
  imports: [MeasurerToolComponent],
  exports: [MeasurerToolComponent]
})
export class IgoAppMeasurerToolModule {}
