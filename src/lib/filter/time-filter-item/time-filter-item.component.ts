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

  handleYearChange(year: string | [string, string]) {
    this.datasource.filterByYear(year);
  }

  handleDateChange(date: Date | [Date, Date]) {
    this.datasource.filterByDate(date);
  }

}
