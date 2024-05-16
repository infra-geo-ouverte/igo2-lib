import { NgModule } from '@angular/core';

import { INTEGRATION_CONTEXT_DIRECTIVES } from './context.directive';

/**
 * @deprecated import the components/directive directly or INTEGRATION_CONTEXT_DIRECTIVES for the set
 */
@NgModule({
  imports: [...INTEGRATION_CONTEXT_DIRECTIVES],
  exports: [...INTEGRATION_CONTEXT_DIRECTIVES]
})
export class IgoAppContextModule {}
