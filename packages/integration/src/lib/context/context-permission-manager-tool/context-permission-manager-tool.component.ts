import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';

@ToolComponent({
  name: 'contextPermissionManager',
  title: 'igo.integration.tools.contexts',
  icon: 'star',
  parent: 'contextManager'
})
@Component({
  selector: 'igo-context-permission-manager-tool',
  templateUrl: './context-permission-manager-tool.component.html'
})
export class ContextPermissionManagerToolComponent {}
