import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

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
