import { NgModule } from '@angular/core';

import { IgoMapModule, IgoMeasureModule } from '@igo2/geo';

import { AppMeasureComponent } from './measure.component';
import { AppMeasureRoutingModule } from './measure-routing.module';
import { SharedModule } from '../../shared/shared.module';

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
