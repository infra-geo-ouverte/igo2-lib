import { NgModule } from '@angular/core';
import { MatButtonModule, MatCardModule } from '@angular/material';

import { IgoDynamicComponentModule } from '@igo2/common';

import {
  AppSalutationComponent,
  AppExplanationComponent,
  AppDynamicComponentComponent
} from './dynamic-component.component';
import { AppDynamicComponentRoutingModule } from './dynamic-component-routing.module';

@NgModule({
  declarations: [
    AppSalutationComponent,
    AppDynamicComponentComponent,
    AppExplanationComponent
  ],
  imports: [
    AppDynamicComponentRoutingModule,
    MatButtonModule,
    MatCardModule,
    IgoDynamicComponentModule
  ],
  exports: [AppDynamicComponentComponent],
  entryComponents: [
    AppSalutationComponent,
    AppExplanationComponent
  ]
})
export class AppDynamicComponentModule {}
