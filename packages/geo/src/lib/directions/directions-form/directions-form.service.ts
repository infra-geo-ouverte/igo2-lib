import { Injectable } from '@angular/core';
import { Stop } from '../shared/directions.interface';

@Injectable()
export class DirectionsFormService {
  private stops: Stop[];

  constructor() {}

  getStopsCoordinates(): [number, number][] {
    const stopsCoordinates = [];
    if (this.stops) {
      this.stops.forEach(stop => {
        stopsCoordinates.push(stop.stopCoordinates);
      });
    }
    return stopsCoordinates;
  }

  setStops(stops: Stop[]) {
    this.stops = stops;
  }

  getStops() {
    return this.stops;
  }

}
