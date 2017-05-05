import { Component, Input } from '@angular/core';

import { FilterableDataSource } from '../../datasource';

@Component({
  selector: 'igo-time-filter-item',
  templateUrl: './time-filter-item.component.html',
  styleUrls: ['./time-filter-item.component.styl']
})
export class TimeFilterItemComponent {

  @Input()
  get datasource(): FilterableDataSource { return this._dataSource; }
  set datasource(value: FilterableDataSource) {
    this._dataSource = value;
  }
  private _dataSource: FilterableDataSource;

  constructor() { }

  handleDateChange(date: Date | [Date, Date]) {
    this.datasource.filterByDate(date);
  }

}
