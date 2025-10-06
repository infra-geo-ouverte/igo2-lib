import { Injectable, inject } from '@angular/core';

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
  private mapService = inject(MapService);
  private projectionService = inject(ProjectionService);
  private storageService = inject(StorageService);
  private configService = inject(ConfigService);

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

  constructor() {
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
