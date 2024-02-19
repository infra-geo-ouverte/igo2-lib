import { NgModule } from '@angular/core';

import { WORKSPACE_DIRECTIVES } from '.';

/**
 * @deprecated import the components directly or WORKSPACE_DIRECTIVES for every components/directives
 */
@NgModule({
  imports: [...WORKSPACE_DIRECTIVES],
  exports: [...WORKSPACE_DIRECTIVES],
  declarations: []
})
export class IgoWorkspaceModule {}
