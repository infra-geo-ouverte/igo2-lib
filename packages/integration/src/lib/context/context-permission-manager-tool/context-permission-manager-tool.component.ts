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
  standalone: true,
  imports: [ContextPermissionsComponent, ContextPermissionsBindingDirective]
})
export class ContextPermissionManagerToolComponent {}
