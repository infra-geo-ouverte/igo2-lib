import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoGeometryFormFieldModule } from './geometry-form-field/geometry-form-field.module';
import { IgoGeometryPredefinedOrDrawModule } from './geometry-predefined-or-draw/geometry-predefined-or-draw.module';

@NgModule({
  imports: [
    CommonModule,
    IgoGeometryFormFieldModule,
    IgoGeometryPredefinedOrDrawModule,
  ],
  exports: [
    IgoGeometryFormFieldModule,
    IgoGeometryPredefinedOrDrawModule
  ],
  declarations: [],
  providers: []
})
export class IgoGeometryModule { }
