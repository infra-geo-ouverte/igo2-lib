import { Injectable, Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Tool } from './tool.interface';
// import { ToolComponent } from './tool-component';

export function Register(toolDef: Tool) {
  return function(cls) {
    ToolService.register(toolDef, cls);
  };
}

@Injectable()
export class ToolService {

  static tools: {[key: string]: [Tool, Component]} = {};

  public toolHistory$ = new BehaviorSubject<Tool[]>([]);
  public selectedTool$ = new BehaviorSubject<Tool>(undefined);

  static register(toolDef: Tool, cls?: Component) {
    ToolService.tools[toolDef.name] = [Object.assign({}, toolDef), cls];
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

  selectTool(tool: Tool) {
    const selectedTool = this.selectedTool$.value;
    if (selectedTool && tool.name === selectedTool.name) {
      return;
    }

    const toolHistory = this.toolHistory$.value
      .filter(t => t.name !== tool.name)
      .concat([Object.assign({}, tool)]);

    this.toolHistory$.next(toolHistory);
    this.selectedTool$.next(toolHistory[toolHistory.length - 1]);
  }

  selectPreviousTool() {
    const toolHistory = this.toolHistory$.value.slice(0, -1);

    this.toolHistory$.next(toolHistory);
    this.selectedTool$.next(toolHistory[toolHistory.length - 1]);
  }

  unselectTool() {
    this.toolHistory$.next([]);
    this.selectedTool$.next(undefined);
  }
}
