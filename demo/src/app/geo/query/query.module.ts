import { NgModule } from '@angular/core';

import { IgoPanelModule } from '@igo2/common';
import {
  IgoMapModule,
  IgoOverlayModule,
  IgoQueryModule,
  IgoFeatureModule
} from '@igo2/geo';

import { AppQueryComponent } from './query.component';
import { AppQueryRoutingModule } from './query-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppQueryComponent],
  imports: [
    AppQueryRoutingModule,
    SharedModule,
    IgoPanelModule,
    IgoMapModule,
    IgoOverlayModule,
    IgoQueryModule,
    IgoFeatureModule
  ],
  exports: [AppQueryComponent]
})
export class AppQueryModule {}
