import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { IgoWidgetModule } from '@igo2/common';

import { SharedModule } from '../../shared/shared.module';
import { AppWidgetRoutingModule } from './widget-routing.module';
import {
  AppSalutationWidgetComponent,
  AppWidgetComponent
} from './widget.component';

@NgModule({
  declarations: [AppSalutationWidgetComponent, AppWidgetComponent],
  imports: [
    SharedModule,
    AppWidgetRoutingModule,
    MatButtonModule,
    MatCardModule,
    IgoWidgetModule
  ],
  exports: [AppWidgetComponent]
})
export class AppWidgetModule {}
