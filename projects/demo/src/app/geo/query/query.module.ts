import { NgModule } from '@angular/core';

import { IgoPanelModule } from '@igo2/common';
import {
  IgoFeatureModule,
  IgoMapModule,
  IgoOverlayModule,
  IgoQueryModule
} from '@igo2/geo';

import { SharedModule } from '../../shared/shared.module';
import { AppQueryRoutingModule } from './query-routing.module';
import { AppQueryComponent } from './query.component';

@NgModule({
  imports: [
    AppQueryRoutingModule,
    SharedModule,
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
