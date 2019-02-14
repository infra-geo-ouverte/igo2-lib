import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoGeometryFormFieldModule } from './geometry-form-field/geometry-form-field.module';
import { GeometryFormFieldComponent } from './geometry-form-field/geometry-form-field.component';

@NgModule({
  imports: [
    CommonModule,
    IgoGeometryFormFieldModule
  ],
  exports: [
    IgoGeometryFormFieldModule
  ],
  declarations: [],
  providers: [],
  entryComponents: [
    GeometryFormFieldComponent
  ]
})
export class IgoGeometryModule {}
