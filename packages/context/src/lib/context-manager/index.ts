import {
  ContextEditBindingDirective,
  ContextEditComponent
} from './context-edit';
import { ContextFormComponent } from './context-form';
import { ContextItemComponent } from './context-item';
import {
  ContextListBindingDirective,
  ContextListComponent
} from './context-list';
import {
  ContextPermissionsBindingDirective,
  ContextPermissionsComponent
} from './context-permissions';
import { LayerContextDirective, MapContextDirective } from './shared';

export * from './shared';
export * from './context-list';
export * from './context-item';
export * from './context-form';
export * from './context-edit';
export * from './context-permissions';

export const CONTEXT_MANAGER_DIRECTIVES = [
  ContextListComponent,
  ContextListBindingDirective,
  ContextItemComponent,
  ContextFormComponent,
  ContextEditComponent,
  ContextEditBindingDirective,
  ContextPermissionsComponent,
  ContextPermissionsBindingDirective,
  MapContextDirective,
  LayerContextDirective
] as const;
