import { NgModule } from '@angular/core';

import { FORM_DIRECTIVES } from '.';

/**
 * @deprecated import the components directly or FORM_DIRECTIVES for every components/directives
 */
@NgModule({
  imports: [...FORM_DIRECTIVES],
  exports: [...FORM_DIRECTIVES]
})
export class IgoFormModule {}
