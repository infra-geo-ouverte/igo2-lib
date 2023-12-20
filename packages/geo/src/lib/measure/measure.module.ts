import { NgModule } from '@angular/core';

import { IgoMeasurerModule } from './measurer/measurer.module';

/**
 * @deprecated import the components directly or the MEASURER_DIRECTIVES for everything
 */
@NgModule({
  imports: [],
  declarations: [],
  exports: [IgoMeasurerModule]
})
export class IgoMeasureModule {}
