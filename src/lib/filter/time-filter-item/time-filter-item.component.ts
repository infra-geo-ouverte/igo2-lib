import { Component, Input } from '@angular/core';

import { TimeFilterableDataSource } from '../../datasource';

@Component({
  selector: 'igo-time-filter-item',
  templateUrl: './time-filter-item.component.html',
  styleUrls: ['./time-filter-item.component.styl']
})
export class TimeFilterItemComponent {

  @Input()
  get datasource(): TimeFilterableDataSource { return this._dataSource; }
  set datasource(value: TimeFilterableDataSource) {
    this._dataSource = value;
  }
  private _dataSource: TimeFilterableDataSource;

  constructor() { }

  handleDateChange(date: Date | [Date, Date]) {
    this.datasource.filterByDate(date);
  }

}
