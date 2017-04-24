import { Component, Input, AfterViewInit } from '@angular/core';

import { IgoMap, MapViewOptions } from '../shared';

@Component({
  selector: 'igo-map-browser',
  templateUrl: './map-browser.component.html',
  styleUrls: ['./map-browser.component.styl']
})
export class MapBrowserComponent implements AfterViewInit {

  @Input()
  get map(): IgoMap { return this._map; }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;

  @Input()
  get view(): MapViewOptions { return this._view; }
  set view(value: MapViewOptions) {
    this._view = value;
    this.map.setView(value);
  }
  private _view: MapViewOptions;

  public id: string = 'igo-map-target';

  constructor() {}

  ngAfterViewInit(): any {
    this.map.olMap.setTarget(this.id);
    // this.map.setView(this.view);
  }
}
