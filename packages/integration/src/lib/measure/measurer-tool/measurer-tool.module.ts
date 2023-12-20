import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { MeasurerComponent } from '@igo2/geo';

import { MeasurerToolComponent } from './measurer-tool.component';

/**
 * @ignore
 */
@NgModule({
  imports: [MeasurerComponent],
  declarations: [MeasurerToolComponent],
  exports: [MeasurerToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppMeasurerToolModule {}
