import { Component, ViewEncapsulation, Input } from '@angular/core';
import { InteractiveTourService } from './interactive-tour.service';
import { ToolService } from '../tool/shared/tool.service';
import { Observable, of } from 'rxjs';

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
  @Input() tourToStart: string = '';
  @Input() styleButton: 'icon' | 'raised';
  @Input() discoverTitleInLocale$: Observable<string> = of('IGO');

  getClass() {
    return {
      'tour-button-tool-icon': this.styleButton === 'icon',
      'tour-button-tool': this.styleButton === 'raised'
    };
  }

  get toolbox() {
    return this.toolService.toolbox;
  }

  getTourToStart() {
    if (this.tourToStart) {
      return this.tourToStart;
    } else {
      return this.activeToolName;
    }
  }

  get activeToolName() {
    if (this.toolbox) {
      if (this.isActiveTool) {
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
    if (this.activeToolName === 'about' && !this.tourToStart) {
      return false;
    }
    return this.interactiveTourService.isToolHaveTourConfig(
      this.getTourToStart()
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

  get disabledTourButton(): boolean {
    return this.interactiveTourService.disabledTourButton(this.activeToolName);
  }

  constructor(
    private interactiveTourService: InteractiveTourService,
    private toolService: ToolService
  ) {}

  startInteractiveTour() {
    const tour = this.getTourToStart();
    if (tour) {
      this.interactiveTourService.startTour(tour);
    } else {
      return;
    }
  }
}
