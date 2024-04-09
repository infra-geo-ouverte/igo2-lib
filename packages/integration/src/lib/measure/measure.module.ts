import { NgModule } from '@angular/core';

import { IgoAppMeasurerToolModule } from './measurer-tool/measurer-tool.module';

/**
 * @deprecated import the MeasurerToolComponent directly
 */
@NgModule({
  exports: [IgoAppMeasurerToolModule]
})
export class IgoAppMeasureModule {}
