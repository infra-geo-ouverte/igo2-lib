import { Injectable } from '@angular/core';

import { Tool } from './tool.interface';

/**
 * Service where runtime tool configurations are registered
 */
@Injectable({
  providedIn: 'root'
})
export class ToolService {

  static tools: {[key: string]: Tool} = {};

  static register(tool: Tool) {
    ToolService.tools[tool.name] = tool;
  }

  constructor() {}

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
