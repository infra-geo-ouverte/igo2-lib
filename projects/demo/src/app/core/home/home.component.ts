import { Component } from '@angular/core';

import { InteractiveTourService } from '@igo2/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class AppHomeComponent {
  constructor(private interactiveTourService: InteractiveTourService) {}

  startTour() {
    this.interactiveTourService.startTour('global');
  }
}
