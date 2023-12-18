import { NgModule } from '@angular/core';

import { IgoPanelModule } from '@igo2/common';
import {
  IgoFeatureModule,
  IgoMapModule,
  IgoOverlayModule,
  IgoQueryModule
} from '@igo2/geo';


import { AppQueryRoutingModule } from './query-routing.module';
import { AppQueryComponent } from './query.component';

@NgModule({
  imports: [
    AppQueryRoutingModule,
    IgoPanelModule,
    IgoMapModule,
    IgoOverlayModule,
    IgoQueryModule,
    IgoFeatureModule,
    AppQueryComponent
],
  exports: [AppQueryComponent]
})
export class AppQueryModule {}
