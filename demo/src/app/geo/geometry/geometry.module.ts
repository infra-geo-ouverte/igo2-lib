import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { IgoFormModule } from '@igo2/common';
import { IgoGeometryModule, IgoMapModule } from '@igo2/geo';

import { AppGeometryComponent } from './geometry.component';
import { AppGeometryRoutingModule } from './geometry-routing.module';

@NgModule({
  declarations: [AppGeometryComponent],
  imports: [
    CommonModule,
    AppGeometryRoutingModule,
    MatButtonModule,
    MatCardModule,
    IgoFormModule,
    IgoGeometryModule,
    IgoMapModule
  ],
  exports: [AppGeometryComponent]
})
export class AppGeometryModule {}
