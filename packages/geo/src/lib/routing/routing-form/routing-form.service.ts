import { Injectable } from '@angular/core';

@Injectable()
export class RoutingFormService {
  private stopsCoordinates: [number, number][];
  private mapWaitingForRoutingClick: boolean;

  constructor() {
    this.mapWaitingForRoutingClick = false;
  }

  getStopsCoordinates(): [number, number][] {
    return this.stopsCoordinates;
  }

  setStopsCoordinates(stopsCoordinates) {
    this.stopsCoordinates = stopsCoordinates;
  }

  isMapWaitingForRoutingClick(): boolean {
    return this.mapWaitingForRoutingClick;
  }

  setMapWaitingForRoutingClick() {
    this.mapWaitingForRoutingClick = true;
  }

  unsetMapWaitingForRoutingClick() {
    this.mapWaitingForRoutingClick = false;
  }
}
