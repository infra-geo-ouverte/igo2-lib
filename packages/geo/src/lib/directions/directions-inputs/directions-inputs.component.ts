import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { Subscription } from 'rxjs';

import { EntityRecord, EntityState, EntityStore } from '@igo2/common';

import { Stop } from '../shared/directions.interface';

import { SearchService } from '../../search/shared/search.service';
import { Feature } from '../../feature/shared/feature.interfaces';
import pointOnFeature from '@turf/point-on-feature';
import { computeRelativePosition, removeStopFromStore, updateStoreSorting } from '../shared/directions.utils';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatOption } from '@angular/material/core';

@Component({
  selector: 'igo-directions-inputs',
  templateUrl: './directions-inputs.component.html',
  styleUrls: ['./directions-inputs.component.scss']
})
export class DirectionsInputsComponent {

  private readonly invalidKeys = ['Control', 'Shift', 'Alt'];

  private search$$: Subscription;
  @Input() stopsStore: EntityStore<Stop>;

  @Input() debounce: number = 200;
  @Input() length: number = 2;

  constructor(
    private searchService: SearchService,
    private cdRef: ChangeDetectorRef
  ) { }

  chooseProposal(event: { source: MatAutocomplete, option: MatOption }, stop: Stop) {
    const result: Feature = event.option.value;
    if (result) {
      let geomCoord;
      const geom = result.geometry;
      if (geom.type === 'Point') {
        geomCoord = geom.coordinates;
      } else {
        const point = pointOnFeature(result.geometry);
        geomCoord = [
          point.geometry.coordinates[0],
          point.geometry.coordinates[1]
        ];
      }
      if (geomCoord) {
        stop.coordinates = geomCoord;
        stop.text = result.meta.title;
        this.stopsStore.update(stop);
      }
    }
  }

  setStopText(event: KeyboardEvent, stop: Stop) {
    const term = (event.target as HTMLInputElement).value;
    if (term.length === 0) {
      this.clearStop(stop);
    } else if (this.validateTerm(term)) {
      stop.text = term;
      this.stopsStore.update(stop);
    }
  }

  validateTerm(term: string) {
    if (
      this.keyIsValid(term) &&
      (term.length >= this.length || term.length === 0)
    ) {
      return true;
    }
    return false;
  }

  private keyIsValid(key: string) {
    return this.invalidKeys.find(value => value === key) === undefined;
  }

  removeStop(stopWithState: EntityRecord<Stop, EntityState>) {
    removeStopFromStore(this.stopsStore, stopWithState);
  }

  clearStop(stop: Stop) {
    this.stopsStore.update({ id: stop.id });
  }

  drop(event: CdkDragDrop<string[]>) {
    this.moveStops(event.previousIndex, event.currentIndex);
  }

  private moveStops(fromIndex, toIndex) {
    if (fromIndex !== toIndex) {
      const stopsWithState = [...this.stopsStore.stateView.all()];
      moveItemInArray(stopsWithState, fromIndex, toIndex);
      stopsWithState.map((stopWithState, i) => {
        const relativePosition = computeRelativePosition(i, stopsWithState.length);
        this.stopsStore.state.update(stopWithState.entity, { position: i, relativePosition });
      });
      updateStoreSorting(this.stopsStore);
    }
  }

}
