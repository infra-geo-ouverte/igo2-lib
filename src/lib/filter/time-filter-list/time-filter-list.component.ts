import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { Layer } from '../../layer';


@Component({
  selector: 'igo-time-filter-list',
  templateUrl: './time-filter-list.component.html',
  styleUrls: ['./time-filter-list.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
