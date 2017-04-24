import { Directive, Self, HostListener } from '@angular/core';

import { Tool, ToolService } from '../shared';
import { ToolbarComponent } from './toolbar.component';


@Directive({
  selector: '[igoToolbarBehavior]'
})
export class ToolbarBehaviorDirective {

  private component: ToolbarComponent;

  @HostListener('select', ['$event']) onSelect(tool: Tool) {
    this.toolService.selectTool(tool);
  }

  constructor(@Self() component: ToolbarComponent,
              private toolService: ToolService) {
    this.component = component;
  }

}
