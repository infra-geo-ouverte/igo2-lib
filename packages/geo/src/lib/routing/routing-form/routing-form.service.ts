import { Injectable } from '@angular/core';

@Injectable()
export class RoutingFormService {
  private stopsCoordinates: [number, number][];

  constructor() {}

  getStopsCoordinates(): [number, number][] {
    return this.stopsCoordinates;
  }

  setStopsCoordinates(stopsCoordinates) {
    this.stopsCoordinates = stopsCoordinates;
  }

}
