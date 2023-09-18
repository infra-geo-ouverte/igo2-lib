import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoWidgetOutletModule } from './widget-outlet/widget-outlet.module';
import { WidgetService } from './shared/widget.service';

@NgModule({
  imports: [CommonModule, IgoWidgetOutletModule],
  exports: [IgoWidgetOutletModule],
  declarations: [],
  providers: [WidgetService]
})
export class IgoWidgetModule {}
