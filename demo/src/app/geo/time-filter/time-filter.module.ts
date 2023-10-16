import { NgModule } from '@angular/core';

import { IgoPanelModule } from '@igo2/common';
import { IgoFilterModule, IgoMapModule } from '@igo2/geo';

import { SharedModule } from '../../shared/shared.module';
import { AppTimeFilterRoutingModule } from './time-filter-routing.module';
import { AppTimeFilterComponent } from './time-filter.component';

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
