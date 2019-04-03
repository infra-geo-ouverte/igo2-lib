import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatButtonModule,
  MatIconModule
} from '@angular/material';

import {
  IgoActionModule,
  IgoEntityModule,
  IgoEditionModule,
  IgoPanelModule
} from '@igo2/common';
import {
  IgoMapModule,
  IgoGeoEditionModule
} from '@igo2/geo';

import { AppEditionComponent } from './edition.component';
import { AppEditionRoutingModule } from './edition-routing.module';

@NgModule({
  declarations: [AppEditionComponent],
  imports: [
    CommonModule,
    AppEditionRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    IgoActionModule,
    IgoEntityModule,
    IgoEditionModule,
    IgoPanelModule,
    IgoMapModule,
    IgoGeoEditionModule
  ],
  exports: [AppEditionComponent]
})
export class AppEditionModule {}
