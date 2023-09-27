import { NgModule } from '@angular/core';

import { AppHomeComponent } from './home.component';
import { AppHomeRoutingModule } from './home-routing.module';
import { IgoInteractiveTourModule } from '@igo2/common';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppHomeComponent],
  imports: [AppHomeRoutingModule, IgoInteractiveTourModule, SharedModule],
  exports: [AppHomeComponent]
})
export class AppHomeModule {}
