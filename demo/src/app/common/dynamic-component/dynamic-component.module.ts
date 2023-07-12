import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

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
    exports: [AppDynamicComponentComponent]
})
export class AppDynamicComponentModule {}
