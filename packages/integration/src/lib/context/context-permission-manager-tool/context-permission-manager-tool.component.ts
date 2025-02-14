import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common/tool';
import {
  ContextPermissionsBindingDirective,
  ContextPermissionsComponent
} from '@igo2/context';

@ToolComponent({
  name: 'contextPermissionManager',
  title: 'igo.integration.tools.contexts',
  icon: 'star',
  parent: 'contextManager'
})
@Component({
  selector: 'igo-context-permission-manager-tool',
  templateUrl: './context-permission-manager-tool.component.html',
  imports: [ContextPermissionsComponent, ContextPermissionsBindingDirective]
})
export class ContextPermissionManagerToolComponent {}
