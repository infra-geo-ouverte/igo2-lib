import { ChangeDetectorRef, Component, Input } from '@angular/core';

import { Subscription } from 'rxjs';

import { LanguageService } from '@igo2/core';
import { EntityStore } from '@igo2/common';
import { uuid } from '@igo2/utils';

import { Stop } from '../shared/directions.interface';

import { SearchService } from '../../search/shared/search.service';

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
    const lastStop = this.allStops[this.stopsStore.count - 1];
    const lastStopId = lastStop.id;
    const lastStopOrder = lastStop.order;
    this.stopsStore.get(lastStopId).order = lastStopOrder + 1;
    this.stopsStore.insert(
      {
        id: uuid(),
        order: lastStopOrder,
        placeholder: 'intermediate'
      });
  }

}
