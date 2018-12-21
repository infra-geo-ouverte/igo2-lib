import { Component, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { getArea, getLength } from 'ol/sphere';
import { LineString, Polygon } from 'ol/geom';

@Injectable({
  providedIn: 'root'
})
export class MeasureService {
  public type$: BehaviorSubject<number> = new BehaviorSubject(0);
  public units$: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor() {}

  setMesurementType(type) {
    this.type$.next(type);
  }

  setUnits(type) {
    this.units$.next(type);
  }

  formatLength(line: LineString) {
    const length = getLength(line);
    let output;
    if (length > 100) {
      output = Math.round((length / 1000) * 100) / 100;
      if (this.units$.getValue() == 1) {
        output = Math.round(0.621371 * output);
        output += ' ' + 'miles';
      } else {
        output += ' ' + 'km';
      }
    } else {
      output = Math.round(length * 100) / 100;
      if (this.units$.getValue() == 1) {
        output = Math.round(0.621371 * output);
        output += ' ' + 'miles';
      } else {
        output += ' ' + 'm';
      }
    }
    return output;
  }

  formatArea(polygon: Polygon) {
    const area = getArea(polygon);
    let output;
    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100;
      if (this.units$.getValue() == 1) {
        output = Math.round(0.621371 * output);
        output += ' ' + 'miles<sup>2</sup>';
      } else {
        output += ' ' + 'km<sup>2</sup>';
      }
    } else {
      output = Math.round(area * 100) / 100;
      if (this.units$.getValue() == 1) {
        output = Math.round(0.621371 * output);
        output += ' ' + 'miles<sup>2</sup>';
      } else {
        output += ' ' + 'm<sup>2</sup>';
      }
    }
    return output;
  }
}
