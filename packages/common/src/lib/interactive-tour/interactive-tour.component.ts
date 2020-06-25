import { Component, ViewEncapsulation } from '@angular/core';
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
      if ( this.isActiveTool) {
      return this.toolbox.activeTool$.getValue().name;
      } else {
        return 'global';
      }
    } else {
      return undefined;
    }
  }

  get isActiveTool(): boolean {
    if (this.toolbox) {
      return this.toolbox.activeTool$.getValue() !== undefined;
    } else {
      return undefined;
    }
  }

  get isToolHaveTour(): boolean {
    if (this.activeToolName === 'about') {
      return false;
    }
    return this.interactiveTourService.isToolHaveTourConfig(
      this.activeToolName
    );
  }

  get showTourButton(): boolean {
    // 2 conditions to show: have Tour on tool in Config file and if we are in mobile displayInMobile= true
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

  get isTourDisplayInMobile(): boolean {
    return this.interactiveTourService.isTourDisplayInMobile();
  }

  constructor(
    private interactiveTourService: InteractiveTourService,
    private toolService: ToolService
  ) {}

  startInteractiveTour(toolName?: string) {
    if (toolName) {
      this.interactiveTourService.startTour(toolName);
    } else {
      return;
    }
  }
}
