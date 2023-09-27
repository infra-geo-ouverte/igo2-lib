import { NgModule } from '@angular/core';

import { IgoDynamicComponentModule } from '@igo2/common';

import {
  AppSalutationComponent,
  AppExplanationComponent,
  AppDynamicComponentComponent
} from './dynamic-component.component';
import { AppDynamicComponentRoutingModule } from './dynamic-component-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    AppSalutationComponent,
    AppDynamicComponentComponent,
    AppExplanationComponent
  ],
  imports: [
    SharedModule,
    AppDynamicComponentRoutingModule,
    IgoDynamicComponentModule
  ],
  exports: [AppDynamicComponentComponent]
})
export class AppDynamicComponentModule {}
