import { NgModule } from '@angular/core';

import { IgoPanelModule } from '@igo2/common';
import { IgoMapModule, IgoFilterModule } from '@igo2/geo';

import { AppTimeFilterComponent } from './time-filter.component';
import { AppTimeFilterRoutingModule } from './time-filter-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppTimeFilterComponent],
  imports: [
    AppTimeFilterRoutingModule,
    SharedModule,
    IgoPanelModule,
    IgoMapModule,
    IgoFilterModule
  ],
  exports: [AppTimeFilterComponent]
})
export class AppTimeFilterModule {}
