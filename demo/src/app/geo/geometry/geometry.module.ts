import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

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
