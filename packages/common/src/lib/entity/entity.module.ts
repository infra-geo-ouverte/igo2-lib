import { NgModule } from '@angular/core';

import { ENTITY_DIRECTIVES } from '.';

/**
 * @deprecated import the components directly or ENTITY_DIRECTIVES for every components/directives
 */
@NgModule({
  imports: [...ENTITY_DIRECTIVES],
  exports: [...ENTITY_DIRECTIVES]
})
export class IgoEntityModule {}
