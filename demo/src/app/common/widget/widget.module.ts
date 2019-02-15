import { NgModule } from '@angular/core';
import { MatButtonModule, MatCardModule } from '@angular/material';

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
  exports: [AppWidgetComponent],
  entryComponents: [
    AppSalutationWidgetComponent
  ]
})
export class AppWidgetModule {}
