import { NgModule } from '@angular/core';

import { FORM_FIELD_DIRECTIVES } from '.';

/**
 * @deprecated import the components directly or FORM_FIELD_DIRECTIVES for every components/directives
 */
@NgModule({
  imports: [...FORM_FIELD_DIRECTIVES],
  exports: [...FORM_FIELD_DIRECTIVES]
})
export class IgoFormFieldModule {}
