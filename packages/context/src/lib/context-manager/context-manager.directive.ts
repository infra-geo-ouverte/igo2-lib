import { ContextEditComponent } from './context-edit';
import { ContextFormComponent } from './context-form';
import { ContextItemComponent } from './context-item';
import { ContextListComponent } from './context-list';
import { ContextPermissionsComponent } from './context-permissions';
import { LayerContextDirective, MapContextDirective } from './shared';

export const CONTEXT_MANAGER_DIRECTIVES = [
  ContextListComponent,
  ContextItemComponent,
  ContextFormComponent,
  ContextEditComponent,
  ContextPermissionsComponent,
  MapContextDirective,
  LayerContextDirective
] as const;
