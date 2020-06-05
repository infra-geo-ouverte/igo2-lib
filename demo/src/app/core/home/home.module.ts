import { NgModule } from '@angular/core';

import { AppHomeComponent } from './home.component';
import { AppHomeRoutingModule } from './home-routing.module';
import { InteractiveTourModule } from '@igo2/common';
import { MatTooltipModule, MatIconModule } from '@angular/material';
@NgModule({
  declarations: [AppHomeComponent],
  imports: [AppHomeRoutingModule, InteractiveTourModule, MatTooltipModule, MatIconModule ],
  exports: [AppHomeComponent]
})
export class AppHomeModule {}
