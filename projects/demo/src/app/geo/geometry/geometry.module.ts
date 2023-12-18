import { NgModule } from '@angular/core';

import { IgoFormModule } from '@igo2/common';
import { IgoGeometryModule, IgoMapModule } from '@igo2/geo';


import { AppGeometryRoutingModule } from './geometry-routing.module';
import { AppGeometryComponent } from './geometry.component';

@NgModule({
  imports: [
    AppGeometryRoutingModule,
    IgoFormModule,
    IgoGeometryModule,
    IgoMapModule,
    AppGeometryComponent
],
  exports: [AppGeometryComponent]
})
export class AppGeometryModule {}
