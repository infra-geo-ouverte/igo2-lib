import { Component } from '@angular/core';
import { InteractiveTourService } from 'packages/common/src/lib/interactive-tour/interactive-tour.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class AppHomeComponent {
  constructor(
    private interactiveTourService: InteractiveTourService) {}

    startTour() {
      this.interactiveTourService.startTour('Global');
    }

}
