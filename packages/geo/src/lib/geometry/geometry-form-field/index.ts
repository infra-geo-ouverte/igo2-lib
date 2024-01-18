import { GeometryFormFieldInputComponent } from './geometry-form-field-input.component';
import { GeometryFormFieldComponent } from './geometry-form-field.component';

export * from './geometry-form-field-input.component';
export * from './geometry-form-field.component';

export const GEOMETRY_FORM_FIELD_DIRECTIVES = [
  GeometryFormFieldComponent,
  GeometryFormFieldInputComponent
] as const;
