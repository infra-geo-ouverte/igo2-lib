import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { StorageService } from '@igo2/core/storage';
import {
  IgoMap,
  MapService,
  OverlayService,
  ProjectionService
} from '@igo2/geo';

/**
 * Service that holds the state of the map module
 */
@Injectable({
  providedIn: 'root'
})
export class MapState {
  private mapService = inject(MapService);
  // eslint-disable-next-line @typescript-eslint/no-unused-private-class-members
  private projectionService = inject(ProjectionService);
  private storageService = inject(StorageService);
  private configService = inject(ConfigService);
  private overlayService = inject(OverlayService);

  get showAllLegendsValue(): boolean | undefined {
    return this._legendToolShowAll;
  }

  set showAllLegendsValue(value) {
    this._legendToolShowAll = value;
  }
  private _legendToolShowAll: boolean | undefined;

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

    this._map.initializeOverlays(this.overlayService);
    this.mapService.setMap(this.map);
  }
}
