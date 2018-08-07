import { NgModule } from '@angular/core';
import {
  MatCardModule,
  MatButtonModule,
  MatIconModule
} from '@angular/material';

import { IgoPanelModule } from '@igo2/common';
import { IgoMapModule, IgoFilterModule } from '@igo2/geo';

import { AppOgcFilterComponent } from './ogc-filter.component';
import { AppOgcFilterRoutingModule } from './ogc-filter-routing.module';

@NgModule({
  declarations: [AppOgcFilterComponent],
  imports: [
    AppOgcFilterRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    IgoPanelModule,
    IgoMapModule,
    IgoFilterModule
  ],
  exports: [AppOgcFilterComponent]
})
export class AppOgcFilterModule {}
