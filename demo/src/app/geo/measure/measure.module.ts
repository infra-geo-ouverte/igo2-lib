import { NgModule } from '@angular/core';
import {
  MatCardModule,
  MatButtonModule,
  MatSelectModule,
  MatOptionModule
} from '@angular/material';

import { IgoMessageModule } from '@igo2/core';
import { IgoMapModule, IgoMeasureModule } from '@igo2/geo';

import { AppMeasureComponent } from './measure.component';
import { AppMeasureRoutingModule } from './measure-routing.module';

@NgModule({
  declarations: [AppMeasureComponent],
  imports: [
    AppMeasureRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    IgoMessageModule,
    IgoMapModule,
    IgoMeasureModule
  ],
  exports: [AppMeasureComponent]
})
export class AppMeasureModule {}
