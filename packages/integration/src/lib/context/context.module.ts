import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { IgoContextModule } from '@igo2/context';

import { ContextEditorToolComponent } from './context-editor-tool/context-editor-tool.component';
import { ContextManagerToolComponent } from './context-manager-tool/context-manager-tool.component';
import { ContextPermissionManagerToolComponent } from './context-permission-manager-tool/context-permission-manager-tool.component';

@NgModule({
  imports: [IgoContextModule],
  declarations: [
    ContextEditorToolComponent,
    ContextManagerToolComponent,
    ContextPermissionManagerToolComponent
  ],
  exports: [
    ContextEditorToolComponent,
    ContextManagerToolComponent,
    ContextPermissionManagerToolComponent
  ],
  entryComponents: [
    ContextEditorToolComponent,
    ContextManagerToolComponent,
    ContextPermissionManagerToolComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppContextModule {}
