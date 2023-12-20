import { NgModule } from '@angular/core';

import { SPINNER_DIRECTIVES } from '.';

/**
 * @deprecated import the components/directives directly or SPINNER_DIRECTIVES for every components/directives
 */
@NgModule({
  imports: [...SPINNER_DIRECTIVES],
  exports: [...SPINNER_DIRECTIVES]
})
export class IgoSpinnerModule {}
