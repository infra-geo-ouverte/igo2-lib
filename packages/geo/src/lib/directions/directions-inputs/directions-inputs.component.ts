import { Component, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import * as olProj from 'ol/proj';
import * as olObservable from 'ol/Observable';

import { Stop } from '../shared/directions.interface';

import { Feature } from '../../feature/shared/feature.interfaces';
import pointOnFeature from '@turf/point-on-feature';
import { computeRelativePosition, removeStopFromStore, updateStoreSorting } from '../shared/directions.utils';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatOption } from '@angular/material/core';
import { StopsFeatureStore, StopsStore } from '../shared/store';
import { roundCoordTo } from '../../map/shared/map.utils';

@Component({
  selector: 'igo-directions-inputs',
  templateUrl: './directions-inputs.component.html',
  styleUrls: ['./directions-inputs.component.scss']
})
export class DirectionsInputsComponent {

  private readonly invalidKeys = ['Control', 'Shift', 'Alt'];
  private onMapClickEventKeys = [];

  @Input() stopsStore: StopsStore;
  @Input() stopsFeatureStore: StopsFeatureStore;
  @Input() projection: string;
  @Input() coordRoundedDecimals: number = 6;

  @Input() debounce: number = 200;
  @Input() length: number = 2;

  constructor() { }

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
    this.unlistenMapSingleClick();
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

  removeStop(stop: Stop) {
    removeStopFromStore(this.stopsStore, stop);
  }

  clearStop(stop: Stop) {
    this.stopsStore.update({ id: stop.id, relativePosition: stop.relativePosition, position: stop.position });
  }

  drop(event: CdkDragDrop<string[]>) {
    this.moveStops(event.previousIndex, event.currentIndex);
  }

  private moveStops(fromIndex, toIndex) {
    if (fromIndex !== toIndex) {
      const stops = [...this.stopsStore.view.all()];
      moveItemInArray(stops, fromIndex, toIndex);
      stops.map((stop, i) => {
        stop.relativePosition = computeRelativePosition(i, stops.length);
        stop.position = i;
      });
      this.stopsStore.updateMany(stops);
      updateStoreSorting(this.stopsStore);
    }
  }

  onInputFocus(stop: Stop) {
    if (!stop.text || stop.text?.length === 0) {
      this.unlistenMapSingleClick();
      this.listenMapSingleClick(stop);
    }
  }

  private listenMapSingleClick(stop: Stop) {
    const key = this.stopsFeatureStore.layer.map.ol.once('singleclick', event => {
      const clickCoordinates = olProj.transform(
        event.coordinate,
        this.stopsFeatureStore.layer.map.projection,
        this.projection
      );
      const roundedCoord = roundCoordTo(clickCoordinates as [number, number], this.coordRoundedDecimals);
      stop.text = roundedCoord.join(',');
      stop.coordinates = roundedCoord;
      this.stopsStore.update(stop);
    });
    this.onMapClickEventKeys.push(key);
  }

  private unlistenMapSingleClick() {
    this.onMapClickEventKeys.map(key => {
      olObservable.unByKey(key);
    });
    this.onMapClickEventKeys = [];
  }
}
