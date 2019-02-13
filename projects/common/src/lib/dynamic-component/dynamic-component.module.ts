import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLibDynamicOutletModule } from './dynamic-outlet/dynamic-outlet.module';
import { DynamicComponentService } from './shared/dynamic-component.service';

@NgModule({
  imports: [
    CommonModule,
    IgoLibDynamicOutletModule
  ],
  exports: [
    IgoLibDynamicOutletModule
  ],
  providers: [
    DynamicComponentService
  ]
})
export class IgoLibDynamicComponentModule {}
