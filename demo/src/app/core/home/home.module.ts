import { NgModule } from '@angular/core';

import { AppHomeComponent } from './home.component';
import { AppHomeRoutingModule } from './home-routing.module';
import { InteractiveTourModule } from '@igo2/common'

@NgModule({
  declarations: [AppHomeComponent],
  imports: [AppHomeRoutingModule, InteractiveTourModule],
  exports: [AppHomeComponent]
})
export class AppHomeModule {}
