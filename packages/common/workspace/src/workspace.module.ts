import { NgModule } from '@angular/core';

import { WorkspaceSelectorComponent } from './workspace-selector';
import { WorkspaceWidgetOutletComponent } from './workspace-widget-outlet';

export const WORKSPACE_DIRECTIVES = [
  WorkspaceSelectorComponent,
  WorkspaceWidgetOutletComponent
] as const;

/**
 * @deprecated import the components directly or WORKSPACE_DIRECTIVES for every components/directives
 */
@NgModule({
  imports: [...WORKSPACE_DIRECTIVES],
  exports: [...WORKSPACE_DIRECTIVES],
  declarations: []
})
export class IgoWorkspaceModule {}
