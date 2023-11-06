import { NgModule } from '@angular/core';

import { IgoDynamicComponentModule } from '@igo2/common';

import { SharedModule } from '../../shared/shared.module';
import { AppDynamicComponentRoutingModule } from './dynamic-component-routing.module';
import {
  AppDynamicComponentComponent,
  AppExplanationComponent,
  AppSalutationComponent
} from './dynamic-component.component';

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
