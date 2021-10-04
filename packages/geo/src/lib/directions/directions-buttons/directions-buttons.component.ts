import { Component, Input } from '@angular/core';

import { addStopToStore } from '../shared/directions.utils';
import { RoutesFeatureStore, StopsStore } from '../shared/store';

@Component({
  selector: 'igo-directions-buttons',
  templateUrl: './directions-buttons.component.html',
  styleUrls: ['./directions-buttons.component.scss']
})
export class DirectionsButtonsComponent {

  @Input() stopsStore: StopsStore;
  @Input() routesFeatureStore: RoutesFeatureStore;
  constructor() { }

  resetStops() {
    this.stopsStore.clearStops();
  }

  // stop are always added before the last stop.
  addStop(): void {
    addStopToStore(this.stopsStore);
  }

  copyDirectionsToClipboard() {
    console.log('copyDirectionsToClipboard');
  }

  copyLinkToClipboard() {
    console.log('copyLinkToClipboard');
  }

  zoomRoute() {
    console.log('zoomRoute');
  }
}
