import { NgModule } from '@angular/core';

import { DynamicOutletComponent } from './dynamic-outlet.component';

/**
 * @deprecated import the DynamicOutletComponent directly
 */
@NgModule({
  imports: [DynamicOutletComponent],
  exports: [DynamicOutletComponent]
})
export class IgoDynamicOutletModule {}