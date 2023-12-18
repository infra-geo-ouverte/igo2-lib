import { NgModule } from '@angular/core';

import { IgoFormModule, IgoPanelModule } from '@igo2/common';
import { IgoMessageModule } from '@igo2/core';
import {
  IgoFeatureDetailsModule,
  IgoFeatureModule,
  IgoFilterModule,
  IgoMapModule,
  IgoQueryModule
} from '@igo2/geo';

import { SharedModule } from '../../shared/shared.module';
import { AppSpatialFilterRoutingModule } from './spatial-filter-routing.module';
import { AppSpatialFilterComponent } from './spatial-filter.component';

@NgModule({
  imports: [
    AppSpatialFilterRoutingModule,
    SharedModule,
    IgoPanelModule,
    IgoMapModule,
    IgoMessageModule,
    IgoQueryModule,
    IgoFeatureModule,
    IgoFeatureDetailsModule,
    IgoFilterModule,
    IgoFormModule,
    AppSpatialFilterComponent
  ],
  exports: [AppSpatialFilterComponent]
})
export class AppSpatialFilterModule {}
