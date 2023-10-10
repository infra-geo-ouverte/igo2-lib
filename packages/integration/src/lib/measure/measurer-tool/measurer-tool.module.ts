import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { IgoMeasurerModule } from '@igo2/geo';

import { MeasurerToolComponent } from './measurer-tool.component';

/**
 * @ignore
 */
@NgModule({
  imports: [IgoMeasurerModule],
  declarations: [MeasurerToolComponent],
  exports: [MeasurerToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppMeasurerToolModule {}
