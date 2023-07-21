import { NgModule } from '@angular/core';

import { IgoPanelModule } from '@igo2/common';
import { IgoMapModule, IgoFilterModule } from '@igo2/geo';

import { AppOgcFilterComponent } from './ogc-filter.component';
import { AppOgcFilterRoutingModule } from './ogc-filter-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppOgcFilterComponent],
  imports: [
    AppOgcFilterRoutingModule,
    SharedModule,
    IgoPanelModule,
    IgoMapModule,
    IgoFilterModule
  ],
  exports: [AppOgcFilterComponent]
})
export class AppOgcFilterModule {}
