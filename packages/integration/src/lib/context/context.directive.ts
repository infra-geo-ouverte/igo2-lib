import { ContextEditorToolComponent } from './context-editor-tool/context-editor-tool.component';
import { ContextManagerToolComponent } from './context-manager-tool/context-manager-tool.component';
import { ContextPermissionManagerToolComponent } from './context-permission-manager-tool/context-permission-manager-tool.component';
import { ContextShareToolComponent } from './context-share-tool/context-share-tool.component';

export const INTEGRATION_CONTEXT_DIRECTIVES = [
  ContextEditorToolComponent,
  ContextManagerToolComponent,
  ContextPermissionManagerToolComponent,
  ContextShareToolComponent
] as const;
