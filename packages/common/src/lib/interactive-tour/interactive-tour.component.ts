import { Component, ViewEncapsulation } from '@angular/core';

import { InteractiveTourService } from './interactive-tour.service';
import { Toolbox } from '../tool/shared/toolbox';
import { ToolService } from '../tool/shared/tool.service';

@Component({
  selector: 'igo-interactive-tour',
  templateUrl: './interactive-tour.component.html',
  styleUrls: ['./interactive-tour.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InteractiveTourComponent {
  /**
   * Toolbox that holds main tools
   */
  toolbox: Toolbox = new Toolbox();

  get activeTool() {
    return this.toolbox.activeTool$.getValue().name;
  }

  get isActiveTool() {
    return this.toolbox.activeTool$.getValue() !== undefined;
  }

  constructor(
    private interactiveTourService: InteractiveTourService,
    private toolService: ToolService) {
      this.toolbox.setTools(this.toolService.getTools());
    }

  startInteractiveTour(toolName?: string) {
    if (toolName) {
      this.interactiveTourService.startTour(toolName);
    } else {
      this.interactiveTourService.startTour('Global');
    }
  }
}
