import { Injectable } from '@angular/core';

import { IgoMap } from '@igo2/geo';

/**
 * Service that holds the state of the map module
 */
@Injectable({
  providedIn: 'root'
})
export class MapState {
  /**
   * Active map
   */
  get map(): IgoMap {
    return this._map;
  }
  private _map: IgoMap;

  constructor() {
    this._map = new IgoMap({
      controls: {
        scaleLine: true,
        attribution: {
          collapsed: false
        }
      }
    });
  }
}
