import { NgModule } from '@angular/core';

import { IgoGeometryFormFieldModule } from './geometry-form-field/geometry-form-field.module';

/**
 * @deprecated import the components directly or the GEOMETRY_FORM_FIELD_DIRECTIVES for the set
 */
@NgModule({
  exports: [IgoGeometryFormFieldModule]
})
export class IgoGeometryModule {}
