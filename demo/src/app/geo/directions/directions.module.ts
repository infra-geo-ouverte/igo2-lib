import { NgModule } from '@angular/core';
import { MatCardModule, MatButtonModule } from '@angular/material';

import { IgoMessageModule } from '@igo2/core';
import {
  IgoMapModule,
  IgoRoutingModule,
  provideOsrmRoutingSource
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
    IgoRoutingModule
  ],
  exports: [AppDirectionsComponent],
  providers: [provideOsrmRoutingSource()]
})
export class AppDirectionsModule {}
