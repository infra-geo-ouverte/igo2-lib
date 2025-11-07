import { Component, inject } from '@angular/core';

import {
  IgoInteractiveTourModule,
  InteractiveTourService
} from '@igo2/common/interactive-tour';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [DocViewerComponent, IgoInteractiveTourModule]
})
export class AppHomeComponent {
  private interactiveTourService = inject(InteractiveTourService);

  startTour() {
    this.interactiveTourService.startTour('global');
  }
}
