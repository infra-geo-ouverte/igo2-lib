import { Tool } from './tool.interface';
import { ToolService } from './tool.service';

export function ToolComponent(tool: Partial<Tool>): (cls: any) => any {
  return (compType: any) => {
    ToolService.register(
      Object.assign({}, tool, {
        component: compType
      } as Tool)
    );
  };
}
