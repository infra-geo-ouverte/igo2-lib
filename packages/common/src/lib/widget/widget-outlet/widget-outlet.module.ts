import { NgModule } from '@angular/core';

import { WidgetOutletComponent } from './widget-outlet.component';

/**
 * @deprecated import the WidgetOutletComponent directly
 */
@NgModule({
  imports: [WidgetOutletComponent],
  exports: [WidgetOutletComponent]
})
export class IgoWidgetOutletModule {}
