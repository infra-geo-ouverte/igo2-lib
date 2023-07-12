import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

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
