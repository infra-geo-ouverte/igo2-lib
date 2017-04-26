import { Injectable } from '@angular/core';

import { IgoMap } from './map';


/**
 * MapService
 *
 * This service tracks the IgoMap instance, if any.
 * Currently, only one map instance is supported
 * but support for multiple maps may be added in the future.
 * This will impact other services such as the OverlayService
 * because these maps won't be sharing overlayed features.
 */
@Injectable()
export class MapService {

  private map: IgoMap;

  constructor() {}

  getMap(): IgoMap {
    if (this.map === undefined) {
      throw new Error('No map instance found.');
    }

    return this.map;
  }

  setMap(map: IgoMap) {
    if (this.map !== undefined) {
      throw new Error('No more than one map is supported.');
    }

    this.map = map;
  }
}
