import { Component, Input } from '@angular/core';

import { Register } from '../../tool';

import { Layer } from '../../layer';

@Register({
  name: 'timeFilter',
  title: 'igo.timeAnalysis',
  icon: 'history'
})
@Component({
  selector: 'igo-time-filter-list',
  templateUrl: './time-filter-list.component.html',
  styleUrls: ['./time-filter-list.component.styl']
})
export class TimeFilterListComponent {

  @Input()
  get layers(): Layer[] { return this._layers; }
  set layers(value: Layer[]) {
    this._layers = value;
  }
  private _layers: Layer[] = [];

  constructor() {}

}
