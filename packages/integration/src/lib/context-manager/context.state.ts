import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { Tool } from '@igo2/common';
import { DetailedContext } from '@igo2/context';

import { ToolState } from '../tool/tool.state';

/**
 * Service that holds the state of the search module
 */
@Injectable({
  providedIn: 'root'
})
export class ContextState {

  /**
   * Toolbox that holds main tools
   */
  public context$: BehaviorSubject<DetailedContext> = new BehaviorSubject(undefined);

  constructor(private toolState: ToolState) {}

  setContext(context: DetailedContext) {
    this.updateTools(context);
    this.context$.next(context);
  }

  private updateTools(context: DetailedContext) {
    const toolbox = this.toolState.toolbox;

    const tools = [];
    const contextTools = context.tools || [];
    contextTools.forEach((contextTool: Tool) => {
      const baseTool = toolbox.getTool(contextTool.name);
      if (baseTool === undefined) { return; }

      const options = Object.assign(
        {},
        baseTool.options || {},
        contextTool.options || {}
      );
      const tool = Object.assign({}, baseTool, contextTool, {options});
      tools.push(tool);
    });

    toolbox.setTools(tools);
    toolbox.setToolbar(context.toolbar || []);
  }
}
