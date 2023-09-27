import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoGeometryFormFieldModule } from './geometry-form-field/geometry-form-field.module';

@NgModule({
  imports: [CommonModule, IgoGeometryFormFieldModule],
  exports: [IgoGeometryFormFieldModule],
  declarations: [],
  providers: []
})
export class IgoGeometryModule {}
