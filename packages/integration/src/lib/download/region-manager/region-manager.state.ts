import { Injectable } from '@angular/core';
import { DisplayRegion } from './region-manager.component';


@Injectable({
  providedIn: 'root'
})
export class RegionManagerState {
  private _selectedRegion: DisplayRegion = { 
    id: -1,
    status: undefined,
    name: undefined,
    numberOfTiles: undefined,
    parentUrls: new Array(),
    parentFeatureText: new Array()
  };
  
  constructor() {}

  set selectedRegion(region: DisplayRegion) {
    if (!region) {
      this._selectedRegion = { 
        id: -1,
        status: undefined,
        name: undefined,
        numberOfTiles: undefined,
        parentUrls: new Array(),
        parentFeatureText: new Array()
      }
      return;
    }
    this._selectedRegion = region;
  }

  get selectedRegion(): DisplayRegion {
    return this._selectedRegion;
  }
}
