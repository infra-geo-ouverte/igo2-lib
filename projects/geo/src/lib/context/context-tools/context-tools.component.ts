import { Component, Input, Output, EventEmitter } from '@angular/core';

import { DetailedContext } from '../shared/context.interface';
import { Tool } from '../../tool/shared/tool.interface';

@Component({
  selector: 'igo-context-tools',
  templateUrl: './context-tools.component.html',
  styleUrls: ['./context-tools.component.scss']
})
export class ContextToolsComponent {
  @Input()
  get context(): DetailedContext {
    return this._context;
  }
  set context(value: DetailedContext) {
    this._context = value;
  }
  private _context: DetailedContext;

  @Input()
  get tools(): Tool[] {
    return this._tools;
  }
  set tools(value: Tool[]) {
    this._tools = value;
  }
  private _tools: Tool[];

  @Output() addTool: EventEmitter<Tool> = new EventEmitter();
  @Output() removeTool: EventEmitter<Tool> = new EventEmitter();

  constructor() {}

  getContextTool(id: string) {
    if (!this.context || !this.context.tools) {
      return;
    }
    return this.context.tools.find(c => c.id === id);
  }

  verifyIfContextToolExist(id: string) {
    return this.getContextTool(id) !== undefined;
  }

  handleToolChange(e, tool: Tool) {
    if (e.checked) {
      this.addTool.emit(tool);
    } else {
      this.removeTool.emit(tool);
    }
  }
}
