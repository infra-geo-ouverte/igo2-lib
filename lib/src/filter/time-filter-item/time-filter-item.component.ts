import { Component, Input } from '@angular/core';

import { FilterableLayer } from '../../layer';

@Component({
  selector: 'igo-time-filter-item',
  templateUrl: './time-filter-item.component.html',
  styleUrls: ['./time-filter-item.component.styl']
})
export class TimeFilterItemComponent {

  @Input()
  get layer(): FilterableLayer { return this._layer; }
  set layer(value: FilterableLayer) {
    this._layer = value;
  }
  private _layer: FilterableLayer;

  constructor() { }

  handleDateChange(date: Date | [Date, Date]) {
    this.layer.filterByDate(date);
  }

}
