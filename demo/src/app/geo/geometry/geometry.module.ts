import { NgModule } from '@angular/core';

import { IgoFormModule } from '@igo2/common';
import { IgoGeometryModule, IgoMapModule } from '@igo2/geo';

import { AppGeometryComponent } from './geometry.component';
import { AppGeometryRoutingModule } from './geometry-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppGeometryComponent],
  imports: [
    SharedModule,
    AppGeometryRoutingModule,
    IgoFormModule,
    IgoGeometryModule,
    IgoMapModule
  ],
  exports: [AppGeometryComponent]
})
export class AppGeometryModule {}
