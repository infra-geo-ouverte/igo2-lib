import { FORM_FIELD_DIRECTIVES } from './form-field';
import { FormGroupComponent } from './form-group/form-group.component';
import { FormComponent } from './form/form.component';

export * from './shared';
export * from './form-group/form-group.component';
export * from './form-field';
export * from './form/form.component';

export const FORM_DIRECTIVES = [
  ...FORM_FIELD_DIRECTIVES,
  FormGroupComponent,
  FormComponent
] as const;
