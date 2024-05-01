import { NgModule } from '@angular/core';

import { MeasureFormatPipe } from './measure-format.pipe';
import { MeasurerComponent } from './measurer.component';

/**
 * @deprecated import the components directly or the MEASURER_DIRECTIVES for the set
 */
@NgModule({
  imports: [MeasureFormatPipe, MeasurerComponent],
  exports: [MeasureFormatPipe, MeasurerComponent]
})
export class IgoMeasurerModule {}
