import { ContextImportExportComponent } from './context-import-export';
import { CONTEXT_MANAGER_DIRECTIVES } from './context-manager';
import { CONTEXT_MAP_BUTTON_DIRECTIVES } from './context-map-button';
import { SHARE_MAP_DIRECTIVES } from './share-map';
import { SidenavComponent } from './sidenav';

export const CONTEXT_DIRECTIVES = [
  ContextImportExportComponent,
  SidenavComponent,
  ...CONTEXT_MANAGER_DIRECTIVES,
  ...CONTEXT_MAP_BUTTON_DIRECTIVES,
  ...SHARE_MAP_DIRECTIVES
] as const;
