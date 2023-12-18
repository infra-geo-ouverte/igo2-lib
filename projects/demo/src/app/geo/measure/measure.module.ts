import { NgModule } from '@angular/core';

import { IgoMapModule, IgoMeasureModule } from '@igo2/geo';


import { AppMeasureRoutingModule } from './measure-routing.module';
import { AppMeasureComponent } from './measure.component';

@NgModule({
  imports: [
    AppMeasureRoutingModule,
    IgoMapModule,
    IgoMeasureModule,
    AppMeasureComponent
],
  exports: [AppMeasureComponent]
})
export class AppMeasureModule {}
