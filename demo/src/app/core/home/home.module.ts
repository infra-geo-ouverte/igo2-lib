import { NgModule } from '@angular/core';
import {
  MatTooltipModule,
  MatIconModule,
  MatButtonModule
} from '@angular/material';

import { AppHomeComponent } from './home.component';
import { AppHomeRoutingModule } from './home-routing.module';
import { IgoInteractiveTourModule } from '@igo2/common';

@NgModule({
  declarations: [AppHomeComponent],
  imports: [
    AppHomeRoutingModule,
    IgoInteractiveTourModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [AppHomeComponent]
})
export class AppHomeModule {}
