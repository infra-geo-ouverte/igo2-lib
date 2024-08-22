import { NgModule } from '@angular/core';

import { FormComponent } from './form';
import { FORM_FIELD_DIRECTIVES } from './form-field';
import { FormGroupComponent } from './form-group';

export const FORM_DIRECTIVES = [
  ...FORM_FIELD_DIRECTIVES,
  FormGroupComponent,
  FormComponent
] as const;

/**
 * @deprecated import the components directly or FORM_DIRECTIVES for every components/directives
 */
@NgModule({
  imports: [...FORM_DIRECTIVES],
  exports: [...FORM_DIRECTIVES]
})
export class IgoFormModule {}
