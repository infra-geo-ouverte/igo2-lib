import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { WidgetService } from './shared/widget.service';
import { IgoWidgetOutletModule } from './widget-outlet/widget-outlet.module';

@NgModule({
  imports: [CommonModule, IgoWidgetOutletModule],
  exports: [IgoWidgetOutletModule],
  declarations: [],
  providers: [WidgetService]
})
export class IgoWidgetModule {}
