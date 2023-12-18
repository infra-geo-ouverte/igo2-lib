import { Component } from '@angular/core';

import { InteractiveTourService } from '@igo2/common';

import { IgoInteractiveTourModule } from '../../../../../../packages/common/src/lib/interactive-tour/interactive-tour.module';
import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [DocViewerComponent, IgoInteractiveTourModule]
})
export class AppHomeComponent {
  constructor(private interactiveTourService: InteractiveTourService) {}

  startTour() {
    this.interactiveTourService.startTour('global');
  }
}
