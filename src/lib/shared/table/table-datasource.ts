import { DataSource } from '@angular/cdk';
import { MdSort } from '@angular/material';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { TableDatabase, TableModel } from './index';

export class TableDataSource extends DataSource<any> {
  _filterChange = new BehaviorSubject('');
  get filter(): string { return this._filterChange.value; }
  set filter(filter: string) { this._filterChange.next(filter); }

  constructor(private _database: TableDatabase,
              private _model: TableModel,
              private _sort: MdSort) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<any[]> {
    if (!this._database) { return Observable.merge([]); }
    const displayDataChanges = [
      this._database.dataChange,
      this._filterChange,
      this._sort.mdSortChange
    ];

    return Observable.merge(...displayDataChanges)
    .map(() => {
      return this.getFilteredData(this._database.data);
    }).map((data) => {
      return this.getSortedData(data);
    });
  }

  disconnect() {}

  getFilteredData(data): any[] {
    if (!this.filter) { return data; }
    return data.slice().filter((item: any) => {

      let searchStr: string = this._model.columns
        .filter((c) => c.filterable)
        .map((c) => item[c.name])
        .join(' ').toLowerCase();

      return searchStr.indexOf(this.filter.toLowerCase()) != -1;
    });
  }

  getSortedData(data): any[] {
    if (!this._sort.active || this._sort.direction == '') { return data; }

    return data.sort((a, b) => {
      let propertyA: number|string = a[this._sort.active];
      let propertyB: number|string = b[this._sort.active];

      let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction == 'asc' ? 1 : -1);
    });
  }
}
