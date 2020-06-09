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

  get activeToolName() {
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

  get isToolHaveTour() {
    if (this.isActiveTool) {
      return this.interactiveTourService.isToolHaveTourConfig(this.activeToolName);
    } else {
      return false;
    }
  }
  get showTourButton() {
  // 2 conditions to show: haveTourConfig and if we are in mobile displayInMobile= true
    let haveTour: boolean;
    haveTour = this.isToolHaveTour;
    if (haveTour === false) {
      return false;
    }

    let inMobileAndShow: boolean;
    if (this.interactiveTourService.isMobile()) {
      inMobileAndShow = this.isTourDisplayInMobile;
      if (inMobileAndShow === false) {
        return false;
      }
    }
    return true;
  }

  get isTourDisplayInMobile() {
    return this.interactiveTourService.isTourDisplayInMobile();
  }

  // @Input() toast = false;

  constructor(
    private interactiveTourService: InteractiveTourService,
    private toolService: ToolService,
    private languageService: LanguageService) {}

  startInteractiveTour(toolName?: string) {
    if (toolName) {
      this.interactiveTourService.startTour(toolName);
    } else {
      return;
    }
  }
}
