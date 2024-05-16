import { Injectable } from '@angular/core';

import { Tool } from './tool.interface';
import { Toolbox } from './toolbox';

/**
 * Service where runtime tool configurations are registered
 */
@Injectable({
  providedIn: 'root'
})
export class ToolService {
  static tools: { [key: string]: Tool } = {};

  /**
   * Toolbox that holds main tools
   */
  public toolbox: Toolbox = new Toolbox();

  static register(tool: Tool) {
    ToolService.tools[tool.name] = tool;
  }

  constructor() {
    this.toolbox.setTools(this.getTools());
  }

  /**
   * Return a tool
   * @param name Tool name
   * @returns tool Tool
   */
  getTool(name: string): Tool {
    return ToolService.tools[name];
  }

  /**
   * Return all tools
   * @returns tTols
   */
  getTools(): Tool[] {
    return Object.values(ToolService.tools);
  }
}
