import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IgoDynamicComponentModule } from '../../dynamic-component/dynamic-component.module';
import { WidgetOutletComponent } from './widget-outlet.component';

/**
 * @ignore
 */
@NgModule({
    imports: [CommonModule, IgoDynamicComponentModule, WidgetOutletComponent],
    exports: [WidgetOutletComponent]
})
export class IgoWidgetOutletModule {}
