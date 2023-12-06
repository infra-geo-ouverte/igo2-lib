import { NgModule } from '@angular/core';

import { IgoPanelModule } from '@igo2/common';
import { IgoFilterModule, IgoMapModule } from '@igo2/geo';

import { SharedModule } from '../../shared/shared.module';
import { AppOgcFilterRoutingModule } from './ogc-filter-routing.module';
import { AppOgcFilterComponent } from './ogc-filter.component';

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
