import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoContextModule } from '@igo2/context';

import { ContextManagerToolComponent } from './context-manager-tool/context-manager-tool.component';
import { ToolsContextManagerToolComponent } from './tools-context-manager-tool/tools-context-manager-tool.component';
import { PermissionsContextManagerToolComponent } from './permissions-context-manager-tool/permissions-context-manager-tool.component';
import { ContextEditorToolComponent } from './context-editor-tool/context-editor-tool.component';

@NgModule({
  imports: [IgoContextModule],
  declarations: [
    ContextManagerToolComponent,
    ToolsContextManagerToolComponent,
    PermissionsContextManagerToolComponent,
    ContextEditorToolComponent
  ],
  exports: [
    ContextManagerToolComponent,
    ToolsContextManagerToolComponent,
    PermissionsContextManagerToolComponent,
    ContextEditorToolComponent
  ],
  entryComponents: [
    ContextManagerToolComponent,
    ToolsContextManagerToolComponent,
    PermissionsContextManagerToolComponent,
    ContextEditorToolComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppContextManagerModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoAppContextManagerModule,
      providers: []
    };
  }
}
