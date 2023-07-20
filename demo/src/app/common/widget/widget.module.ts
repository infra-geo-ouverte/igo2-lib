import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

import { IgoWidgetModule } from '@igo2/common';

import {
  AppSalutationWidgetComponent,
  AppWidgetComponent
} from './widget.component';
import { AppWidgetRoutingModule } from './widget-routing.module';

@NgModule({
    declarations: [
        AppSalutationWidgetComponent,
        AppWidgetComponent
    ],
    imports: [
        AppWidgetRoutingModule,
        MatButtonModule,
        MatCardModule,
        IgoWidgetModule
    ],
    exports: [AppWidgetComponent]
})
export class AppWidgetModule {}
