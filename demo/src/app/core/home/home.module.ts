import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
