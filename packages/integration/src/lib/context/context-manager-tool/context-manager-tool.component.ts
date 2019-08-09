import { Component } from '@angular/core';

import { ToolComponent } from '@igo2/common';

import { ToolState } from '../../tool/tool.state';

@ToolComponent({
  name: 'contextManager',
  title: 'igo.integration.tools.contexts',
  icon: 'star'
})
@Component({
  selector: 'igo-context-manager-tool',
  templateUrl: './context-manager-tool.component.html'
})
export class ContextManagerToolComponent {
  constructor(private toolState: ToolState) {}

  editContext() {
    this.toolState.toolbox.activateTool('contextEditor');
  }

  managePermissions() {
    this.toolState.toolbox.activateTool('contextPermissionManager');
  }
}
