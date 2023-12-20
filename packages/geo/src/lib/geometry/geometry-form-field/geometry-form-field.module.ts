import { NgModule } from '@angular/core';

import { GeometryFormFieldInputComponent } from './geometry-form-field-input.component';
import { GeometryFormFieldComponent } from './geometry-form-field.component';

/**
 * @deprecated import the components directly or the GEOMETRY_FORM_FIELD_DIRECTIVES for everything
 */
@NgModule({
  imports: [GeometryFormFieldComponent, GeometryFormFieldInputComponent],
  exports: [GeometryFormFieldComponent, GeometryFormFieldInputComponent]
})
export class IgoGeometryFormFieldModule {}
