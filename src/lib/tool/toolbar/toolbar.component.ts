import { Component } from '@angular/core';

import { ToolbarBaseComponent } from './toolbar-base.component';
import { Tool, ToolService } from '../shared';

@Component({
  selector: 'igo-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.styl']
})
export class ToolbarComponent extends ToolbarBaseComponent {

  constructor(private toolService: ToolService) {
    super();
  }

  handleToolSelect(tool: Tool) {
    super.handleToolSelect(tool);
    this.toolService.selectTool(tool);
  }
}
