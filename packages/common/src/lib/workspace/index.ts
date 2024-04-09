import { WorkspaceSelectorComponent } from './workspace-selector/workspace-selector.component';
import { WorkspaceWidgetOutletComponent } from './workspace-widget-outlet/workspace-widget-outlet.component';

export * from './shared';
export * from './workspace-selector/workspace-selector.component';
export * from './workspace-widget-outlet/workspace-widget-outlet.component';

export const WORKSPACE_DIRECTIVES = [
  WorkspaceSelectorComponent,
  WorkspaceWidgetOutletComponent
] as const;
