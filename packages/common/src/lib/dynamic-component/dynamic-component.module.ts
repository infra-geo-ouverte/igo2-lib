import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IgoDynamicOutletModule } from './dynamic-outlet/dynamic-outlet.module';
import { DynamicComponentService } from './shared/dynamic-component.service';

@NgModule({
  imports: [CommonModule, IgoDynamicOutletModule],
  exports: [IgoDynamicOutletModule],
  providers: [DynamicComponentService]
})
export class IgoDynamicComponentModule {}
