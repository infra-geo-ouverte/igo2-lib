import { Injectable } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { StorageService } from '@igo2/core/storage';
import { IgoMap, MapService, ProjectionService } from '@igo2/geo';

/**
 * Service that holds the state of the map module
 */
@Injectable({
  providedIn: 'root'
})
export class MapState {
  get showAllLegendsValue(): boolean {
    return this._legendToolShowAll;
  }

  set showAllLegendsValue(value) {
    this._legendToolShowAll = value;
  }
  private _legendToolShowAll: boolean;

  /**
   * Active map
   */
  get map(): IgoMap {
    return this._map;
  }
  private _map: IgoMap;

  constructor(
    private mapService: MapService,
    private projectionService: ProjectionService, // Don't remove this or it'll never be injected,
    private storageService: StorageService,
    private configService: ConfigService
  ) {
    this._map = new IgoMap(
      {
        controls: {
          scaleLine: true,
          attribution: {
            collapsed: true
          }
        }
      },
      this.storageService,
      this.configService
    );

    this.mapService.setMap(this.map);
  }
}
