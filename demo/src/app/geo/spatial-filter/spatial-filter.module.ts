import { NgModule } from '@angular/core';
import {
  MatCardModule,
  MatButtonModule,
  MatIconModule
} from '@angular/material';

import { IgoPanelModule } from '@igo2/common';
import { IgoMapModule, IgoFilterModule } from '@igo2/geo';

import { AppSpatialFilterComponent } from './spatial-filter.component';
import { AppSpatialFilterRoutingModule } from './spatial-filter-routing.module';

@NgModule({
  declarations: [AppSpatialFilterComponent],
  imports: [
    AppSpatialFilterRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    IgoPanelModule,
    IgoMapModule,
    IgoFilterModule
  ],
  exports: [AppSpatialFilterComponent]
})
export class AppSpatialFilterModule {}
