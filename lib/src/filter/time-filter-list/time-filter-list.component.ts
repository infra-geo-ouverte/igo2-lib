import { Component, Input } from '@angular/core';

import { IgoMap } from '../../map';

@Component({
  selector: 'igo-time-filter-list',
  templateUrl: './time-filter-list.component.html',
  styleUrls: ['./time-filter-list.component.styl']
})
export class TimeFilterListComponent {

  @Input()
  get map(): IgoMap { return this._map; }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;

  constructor() {}

}
