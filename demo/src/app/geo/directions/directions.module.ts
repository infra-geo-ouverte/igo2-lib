import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { IgoMessageModule } from '@igo2/core';
import {
  IgoMapModule,
  IgoDirectionsModule,
  provideOsrmDirectionsSource
} from '@igo2/geo';

import { AppDirectionsComponent } from './directions.component';
import { AppDirectionsRoutingModule } from './directions-routing.module';

@NgModule({
  declarations: [AppDirectionsComponent],
  imports: [
    AppDirectionsRoutingModule,
    MatCardModule,
    MatButtonModule,
    IgoMessageModule,
    IgoMapModule,
    IgoDirectionsModule
  ],
  exports: [AppDirectionsComponent],
  providers: [provideOsrmDirectionsSource()]
})
export class AppDirectionsModule {}
