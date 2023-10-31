import { NgModule } from '@angular/core';

import { IgoInteractiveTourModule } from '@igo2/common';

import { SharedModule } from '../../shared/shared.module';
import { AppHomeRoutingModule } from './home-routing.module';
import { AppHomeComponent } from './home.component';

@NgModule({
  declarations: [AppHomeComponent],
  imports: [AppHomeRoutingModule, IgoInteractiveTourModule, SharedModule],
  exports: [AppHomeComponent]
})
export class AppHomeModule {}
