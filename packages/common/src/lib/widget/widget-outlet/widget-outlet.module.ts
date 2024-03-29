import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IgoDynamicComponentModule } from '../../dynamic-component/dynamic-component.module';
import { WidgetOutletComponent } from './widget-outlet.component';

/**
 * @ignore
 */
@NgModule({
  imports: [CommonModule, IgoDynamicComponentModule],
  exports: [WidgetOutletComponent],
  declarations: [WidgetOutletComponent]
})
export class IgoWidgetOutletModule {}
