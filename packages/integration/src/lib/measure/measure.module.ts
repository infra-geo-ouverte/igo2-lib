import { NgModule } from '@angular/core';

import { IgoAppMeasurerToolModule } from './measurer-tool/measurer-tool.module';
import { MeasureState } from './measure.state';

@NgModule({
  imports: [],
  declarations: [],
  exports: [
    IgoAppMeasurerToolModule
  ],
  providers: [
    MeasureState
  ]
})
export class IgoAppMeasureModule {}
