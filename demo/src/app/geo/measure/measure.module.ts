import { NgModule } from '@angular/core';

import { IgoMapModule, IgoMeasureModule } from '@igo2/geo';

import { SharedModule } from '../../shared/shared.module';
import { AppMeasureRoutingModule } from './measure-routing.module';
import { AppMeasureComponent } from './measure.component';

@NgModule({
  declarations: [AppMeasureComponent],
  imports: [
    AppMeasureRoutingModule,
    SharedModule,
    IgoMapModule,
    IgoMeasureModule
  ],
  exports: [AppMeasureComponent]
})
export class AppMeasureModule {}
