import { NgModule } from '@angular/core';

import { OgcFilterComponent } from './ogc-filter.component';

/**
 * @deprecated import the OgcFilterComponent directly
 */
@NgModule({
  imports: [OgcFilterComponent],
  exports: [OgcFilterComponent]
})
export class IgoOgcFilterModule {}
