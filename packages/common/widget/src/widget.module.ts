import { NgModule } from '@angular/core';

import { WidgetService } from './shared/widget.service';
import { IgoWidgetOutletModule } from './widget-outlet/widget-outlet.module';

/**
 * @deprecated import the WidgetOutletComponent directly
 */
@NgModule({
  imports: [IgoWidgetOutletModule],
  exports: [IgoWidgetOutletModule],
  declarations: [],
  providers: [WidgetService]
})
export class IgoWidgetModule {}
