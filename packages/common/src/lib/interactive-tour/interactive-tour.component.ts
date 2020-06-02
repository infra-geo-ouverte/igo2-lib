import { Component, ViewEncapsulation, Input } from '@angular/core';

import { LanguageService } from '@igo2/core';
import { InteractiveTourService } from './interactive-tour.service';
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
  get toolbox() {
    return this.toolService.toolbox;
  }

  get activeTool() {
    if (this.toolbox) {
      return this.toolbox.activeTool$.getValue().name;
    } else {
      return undefined;
    }
  }

  get isActiveTool() {
    if (this.toolbox) {
      return this.toolbox.activeTool$.getValue() !== undefined;
    } else {
      return undefined;
    }
  }

  @Input() toast = false;

  constructor(
    private interactiveTourService: InteractiveTourService,
    private toolService: ToolService,
    private languageService: LanguageService) {}

  startInteractiveTour(toolName?: string) {
    if (toolName) {
      this.interactiveTourService.startTour(toolName);
    } else {
      this.interactiveTourService.startTour('Global');
    }
  }
}
