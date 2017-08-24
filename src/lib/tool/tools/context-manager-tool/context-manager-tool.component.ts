import { Component } from '@angular/core';

import { Register, ToolService } from '../../shared';


@Register({
  name: 'contextManager',
  title: 'igo.contexts',
  icon: 'bookmark'
})
@Component({
  selector: 'igo-context-manager-tool',
  templateUrl: './context-manager-tool.component.html',
  styleUrls: ['./context-manager-tool.component.styl']
})
export class ContextManagerToolComponent {

  constructor(private toolService: ToolService) {}

  editContext() {
    const tool = this.toolService.getTool('contextEditor');
    if (tool) {
      this.toolService.selectTool(tool);
    }
  }

  manageTools() {
    const tool = this.toolService.getTool('toolsContextManager');
    if (tool) {
      this.toolService.selectTool(tool);
    }
  }

  managePermissions() {
    const tool = this.toolService.getTool('permissionsContextManager');
    if (tool) {
      this.toolService.selectTool(tool);
    }
  }

}
