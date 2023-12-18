import { NgModule } from '@angular/core';

import { IgoDynamicComponentModule } from '@igo2/common';


import { AppDynamicComponentRoutingModule } from './dynamic-component-routing.module';
import {
  AppDynamicComponentComponent,
  AppExplanationComponent,
  AppSalutationComponent
} from './dynamic-component.component';

@NgModule({
  imports: [
    AppDynamicComponentRoutingModule,
    IgoDynamicComponentModule,
    AppSalutationComponent,
    AppDynamicComponentComponent,
    AppExplanationComponent
],
  exports: [AppDynamicComponentComponent]
})
export class AppDynamicComponentModule {}
