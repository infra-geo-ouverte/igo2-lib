import { NgModule } from '@angular/core';

import { IgoMessageModule } from '@igo2/core';
import {
  IgoDirectionsModule,
  IgoMapModule,
  provideOsrmDirectionsSource
} from '@igo2/geo';

import { SharedModule } from '../../shared/shared.module';
import { AppDirectionsRoutingModule } from './directions-routing.module';
import { AppDirectionsComponent } from './directions.component';

@NgModule({
  declarations: [AppDirectionsComponent],
  imports: [
    AppDirectionsRoutingModule,
    SharedModule,
    IgoMessageModule,
    IgoMapModule,
    IgoDirectionsModule
  ],
  exports: [AppDirectionsComponent],
  providers: [provideOsrmDirectionsSource()]
})
export class AppDirectionsModule {}
