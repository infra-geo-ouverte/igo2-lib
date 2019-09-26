import { Injectable } from '@angular/core';

import { IgoMap, MapService, ProjectionService } from '@igo2/geo';

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
  get map(): IgoMap { return this._map; }
  private _map: IgoMap;

  constructor(
    private mapService: MapService,
    private projectionService: ProjectionService  // Don't remove this or it'll never be injected
  ) {
    this._map = new IgoMap({
      controls: {
        scaleLine: true,
        attribution: {
          collapsed: true
        }
      }
    });

    this.mapService.setMap(this.map);
  }
}
