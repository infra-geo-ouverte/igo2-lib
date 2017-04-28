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

  static toolDefs: {[key: string]: [Tool, Component]} = {};

  public tools$ = new BehaviorSubject<{[key: string]: Tool}>({});
  public toolHistory$ = new BehaviorSubject<Tool[]>([]);
  public selectedTool$ = new BehaviorSubject<Tool>(undefined);

  static register(tool: Tool, cls?: Component) {
    ToolService.toolDefs[tool.name] = [Object.assign({}, tool), cls];
  }

  constructor() {
    const tools = Object.keys(ToolService.toolDefs).map(name => {
      return {name: name};
    });
    this.setTools(tools);
  }

  setTools(tools: Tool[]) {
    const _tools = {};
    tools.forEach(tool => {
      const toolDef = ToolService.toolDefs[tool.name];
      const baseTool = toolDef ? toolDef[0] : {};
      _tools[tool.name] = Object.assign({}, baseTool, tool);
    });

    this.tools$.next(_tools);
  }

  getTool(name: string): Tool {
    return this.tools$.value[name];
  }

  getToolClass(name: string) {
    const toolDef = ToolService.toolDefs[name];

    return toolDef === undefined ? undefined : toolDef[1];
  }

  selectTool(tool: Tool, force = false) {
    const selectedTool = this.selectedTool$.value;
    if (!force && selectedTool && tool.name === selectedTool.name) {
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
