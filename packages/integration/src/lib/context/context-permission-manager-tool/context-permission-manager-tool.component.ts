import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { ContextPermissionsBindingDirective } from '../../../../../context/src/lib/context-manager/context-permissions/context-permissions-binding.directive';
import { ContextPermissionsComponent } from '../../../../../context/src/lib/context-manager/context-permissions/context-permissions.component';

@ToolComponent({
  name: 'contextPermissionManager',
  title: 'igo.integration.tools.contexts',
  icon: 'star',
  parent: 'contextManager'
})
@Component({
    selector: 'igo-context-permission-manager-tool',
    templateUrl: './context-permission-manager-tool.component.html',
    standalone: true,
    imports: [ContextPermissionsComponent, ContextPermissionsBindingDirective]
})
export class ContextPermissionManagerToolComponent {}
