import { Injectable } from '@angular/core';

import { MapBase } from './map.abstract';

/**
 * MapService
 *
 * This service tracks the IgoMap instance, if any.
 * Currently, only one map instance is supported
 * but support for multiple maps may be added in the future.
 * This will impact other services such as the OverlayService
 * because these maps won't be sharing overlayed features.
 */
@Injectable({
  providedIn: 'root'
})
export class MapService {
  private map: MapBase;

  getMap(): MapBase {
    return this.map;
  }

  setMap(map: MapBase) {
    this.map = map;
  }
}
