import { NgModule } from '@angular/core';

import { IgoPanelModule, IgoFormModule } from '@igo2/common';
import { IgoMapModule, IgoFilterModule, IgoQueryModule, IgoFeatureModule, IgoFeatureDetailsModule } from '@igo2/geo';
import { IgoMessageModule } from '@igo2/core';

import { AppSpatialFilterComponent } from './spatial-filter.component';
import { AppSpatialFilterRoutingModule } from './spatial-filter-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppSpatialFilterComponent],
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
    IgoFormModule
  ],
  exports: [AppSpatialFilterComponent]
})
export class AppSpatialFilterModule {}
