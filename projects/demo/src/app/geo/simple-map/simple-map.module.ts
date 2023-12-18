import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { IgoMapModule } from '@igo2/geo';


import { AppSimpleMapRoutingModule } from './simple-map-routing.module';
import { AppSimpleMapComponent } from './simple-map.component';

@NgModule({
  imports: [
    AppSimpleMapRoutingModule,
    MatCardModule,
    MatButtonModule,
    IgoMapModule,
    AppSimpleMapComponent
],
  exports: [AppSimpleMapComponent]
})
export class AppSimpleMapModule {}
