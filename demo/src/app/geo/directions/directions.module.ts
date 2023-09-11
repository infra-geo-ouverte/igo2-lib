import { NgModule } from '@angular/core';

import { IgoMessageModule } from '@igo2/core';
import {
  IgoMapModule,
  IgoDirectionsModule,
  provideOsrmDirectionsSource
} from '@igo2/geo';

import { AppDirectionsComponent } from './directions.component';
import { AppDirectionsRoutingModule } from './directions-routing.module';
import { SharedModule } from '../../shared/shared.module';

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
