import { Injectable, Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Tool } from './tool.interface';
// import { ToolComponent } from './tool-component';

export function Register(toolDef: Tool) {
  return function(cls) {
    ToolService.register(cls, toolDef);
  };
}

@Injectable()
export class ToolService {

  static tools: {[key: string]: [Tool, (typeof Component)]} = {};

  public toolHistory$ = new BehaviorSubject<Tool[]>([]);

  static register(cls: any, toolDef: Tool) {
    const tool = Object.assign({}, toolDef);

    if (cls.toolbar !== undefined) {
      tool['toolbar'] = cls.toolbar;
    }

    ToolService.tools[tool.name] = [tool, cls];
  }

  constructor() {}

  getTool(name: string) {
    const tool = ToolService.tools[name];

    return tool === undefined ? undefined : tool[0];
  }

  getToolClass(name: string) {
    const tool = ToolService.tools[name];

    return tool === undefined ? undefined : tool[1];
  }

  getSelectedTool() {
    const toolHistory = this.toolHistory$.value;

    return toolHistory[toolHistory.length - 1];
  }

  selectTool(tool: Tool) {
    const selectedTool = this.getSelectedTool();
    if (selectedTool && tool.name === selectedTool.name) {
      return;
    }

    const toolHistory = this.toolHistory$.value
      .filter(t => t.name !== tool.name)
      .concat([Object.assign({}, tool)]);

    this.toolHistory$.next(toolHistory);
  }

  selectPreviousTool() {
    const toolHistory = this.toolHistory$.value.slice(0, -1);

    this.toolHistory$.next(toolHistory);
  }
}
