import { NgModule } from '@angular/core';

import { IgoInteractiveTourModule } from '@igo2/common';


import { AppHomeRoutingModule } from './home-routing.module';
import { AppHomeComponent } from './home.component';

@NgModule({
  imports: [
    AppHomeRoutingModule,
    IgoInteractiveTourModule,
    AppHomeComponent
],
  exports: [AppHomeComponent]
})
export class AppHomeModule {}
