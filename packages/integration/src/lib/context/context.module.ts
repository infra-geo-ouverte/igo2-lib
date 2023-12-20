import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { IgoContextModule } from '@igo2/context';

import { ContextEditorToolComponent } from './context-editor-tool/context-editor-tool.component';
import { ContextManagerToolComponent } from './context-manager-tool/context-manager-tool.component';
import { ContextPermissionManagerToolComponent } from './context-permission-manager-tool/context-permission-manager-tool.component';
import { ContextShareToolComponent } from './context-share-tool/context-share-tool.component';

@NgModule({
    imports: [IgoContextModule, ContextEditorToolComponent,
        ContextManagerToolComponent,
        ContextPermissionManagerToolComponent,
        ContextShareToolComponent],
    exports: [
        ContextEditorToolComponent,
        ContextManagerToolComponent,
        ContextPermissionManagerToolComponent,
        ContextShareToolComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoAppContextModule {}
