import { Component, Input } from '@angular/core';

import { EntityStore } from '@igo2/common';

import { Stop } from '../shared/directions.interface';
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

  constructor() { }

  resetStops() {
    this.stopsStore.clear();
  }

  // stop are always added before the last stop.
  addStop(): void {
    addStopToStore(this.stopsStore);
  }
}
