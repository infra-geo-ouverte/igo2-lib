import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DynamicOutletComponent } from './dynamic-outlet.component';

/**
 * @ignore
 */
@NgModule({
    imports: [CommonModule, DynamicOutletComponent],
    exports: [DynamicOutletComponent]
})
export class IgoDynamicOutletModule {}
