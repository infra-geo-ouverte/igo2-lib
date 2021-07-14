import { Injectable } from '@angular/core';
import { RegionDBData } from '@igo2/core/public_api';
import { Subject } from 'rxjs';
import { DisplayRegion } from './region-manager.component';

@Injectable({
  providedIn: 'root'
})
export class RegionManagerState {
  private _selectedRegion: DisplayRegion = this.initDisplayRegion();
  readonly regionToEdit$: Subject<RegionDBData> = new Subject();

  constructor() {}

  private initDisplayRegion(): DisplayRegion {
    return {
      id: -1,
      status: undefined,
      name: undefined,
      numberOfTiles: undefined,
      parentUrls: new Array(),
      parentFeatureText: new Array()
    };
  }

  set selectedRegion(region: DisplayRegion) {
    if (!region) {
      this._selectedRegion = this.initDisplayRegion();
      return;
    }
    this._selectedRegion = region;
  }

  get selectedRegion(): DisplayRegion {
    return this._selectedRegion;
  }
}
