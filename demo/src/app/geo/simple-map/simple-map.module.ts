import { NgModule } from '@angular/core';
import { MatCardModule, MatButtonModule } from '@angular/material';

import { IgoMapModule } from '@igo2/geo';

import { AppSimpleMapComponent } from './simple-map.component';
import { AppSimpleMapRoutingModule } from './simple-map-routing.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [AppSimpleMapComponent],
  imports: [
    CommonModule,
    AppSimpleMapRoutingModule,
    MatCardModule,
    MatButtonModule,
    IgoMapModule
  ],
  exports: [AppSimpleMapComponent]
})
export class AppSimpleMapModule {}
