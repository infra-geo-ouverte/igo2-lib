import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DynamicOutletComponent } from './dynamic-outlet.component';

/**
 * @ignore
 */
@NgModule({
  imports: [CommonModule],
  exports: [DynamicOutletComponent],
  declarations: [DynamicOutletComponent]
})
export class IgoDynamicOutletModule {}
