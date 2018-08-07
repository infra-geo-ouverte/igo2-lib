import { NgModule } from '@angular/core';
import {
  MatCardModule,
  MatButtonModule,
  MatIconModule
} from '@angular/material';

import { IgoPanelModule } from '@igo2/common';
import { IgoMapModule, IgoFilterModule } from '@igo2/geo';

import { AppTimeFilterComponent } from './time-filter.component';
import { AppTimeFilterRoutingModule } from './time-filter-routing.module';

@NgModule({
  declarations: [AppTimeFilterComponent],
  imports: [
    AppTimeFilterRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    IgoPanelModule,
    IgoMapModule,
    IgoFilterModule
  ],
  exports: [AppTimeFilterComponent]
})
export class AppTimeFilterModule {}
