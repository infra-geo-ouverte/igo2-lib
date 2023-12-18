import { NgModule } from '@angular/core';

import { IgoPanelModule } from '@igo2/common';
import { IgoFilterModule, IgoMapModule } from '@igo2/geo';


import { AppTimeFilterRoutingModule } from './time-filter-routing.module';
import { AppTimeFilterComponent } from './time-filter.component';

@NgModule({
  imports: [
    AppTimeFilterRoutingModule,
    IgoPanelModule,
    IgoMapModule,
    IgoFilterModule,
    AppTimeFilterComponent
],
  exports: [AppTimeFilterComponent]
})
export class AppTimeFilterModule {}
