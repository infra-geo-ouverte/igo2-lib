import { NgModule } from '@angular/core';

import { GeometryFormFieldInputComponent } from './geometry-form-field-input.component';
import { GeometryFormFieldComponent } from './geometry-form-field.component';

export const GEOMETRY_FORM_FIELD_DIRECTIVES = [
  GeometryFormFieldComponent,
  GeometryFormFieldInputComponent
] as const;

/**
 * @deprecated import the components directly or the GEOMETRY_FORM_FIELD_DIRECTIVES for the set
 */
@NgModule({
  imports: [GeometryFormFieldComponent, GeometryFormFieldInputComponent],
  exports: [GeometryFormFieldComponent, GeometryFormFieldInputComponent]
})
export class IgoGeometryFormFieldModule {}
