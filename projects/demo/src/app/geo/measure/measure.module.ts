import { NgModule } from '@angular/core';

import { IgoMapModule, IgoMeasureModule } from '@igo2/geo';

import { SharedModule } from '../../shared/shared.module';
import { AppMeasureRoutingModule } from './measure-routing.module';
import { AppMeasureComponent } from './measure.component';

@NgModule({
  imports: [
    AppMeasureRoutingModule,
    SharedModule,
    IgoMapModule,
    IgoMeasureModule,
    AppMeasureComponent
  ],
  exports: [AppMeasureComponent]
})
export class AppMeasureModule {}
