import { Component, Input } from '@angular/core';

import { EntityStore } from '@igo2/common';
import { FeatureStore } from '../../feature/shared/store';

import { FeatureWithDirection, Stop } from '../shared/directions.interface';
import { addStopToStore } from '../shared/directions.utils';

@Component({
  selector: 'igo-directions-buttons',
  templateUrl: './directions-buttons.component.html',
  styleUrls: ['./directions-buttons.component.scss']
})
export class DirectionsButtonsComponent {


  get allStops() {
    return this.stopsStore.view.all();
  }

  @Input() stopsStore: EntityStore<Stop>;
  @Input() routesFeatureStore: FeatureStore<FeatureWithDirection>;
  constructor() { }

  resetStops() {
    this.stopsStore.clear();
  }

  // stop are always added before the last stop.
  addStop(): void {
    addStopToStore(this.stopsStore);
  }

  copyDirectionsToClipboard() {
    console.log('copyDirectionsToClipboard')
  }

  copyLinkToClipboard() {
    console.log('copyLinkToClipboard')
  }

  zoomRoute() {
    console.log('zoomRoute')
  }
}
