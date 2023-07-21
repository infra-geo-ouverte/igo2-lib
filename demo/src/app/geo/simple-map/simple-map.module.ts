import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { IgoMapModule } from '@igo2/geo';

import { AppSimpleMapComponent } from './simple-map.component';
import { AppSimpleMapRoutingModule } from './simple-map-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppSimpleMapComponent],
  imports: [
    SharedModule,
    AppSimpleMapRoutingModule,
    MatCardModule,
    MatButtonModule,
    IgoMapModule
  ],
  exports: [AppSimpleMapComponent]
})
export class AppSimpleMapModule {}
