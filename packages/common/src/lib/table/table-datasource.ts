import { DataSource } from '@angular/cdk/table';
import { MatSort } from '@angular/material/sort';

import { Observable, BehaviorSubject, merge } from 'rxjs';
import { map } from 'rxjs/operators';

import { ObjectUtils } from '@igo2/utils';

import { TableModel } from './table-model.interface';
import { TableDatabase } from './table-database';

export class TableDataSource extends DataSource<any> {
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  private _filterChange = new BehaviorSubject('');

  constructor(
    private _database: TableDatabase,
    private _model: TableModel,
    private _sort: MatSort
  ) {
    super();
  }

  // Connect function called by the table to retrieve one stream containing
  // the data to render.
  connect(): Observable<any[]> {
    if (!this._database) {
      return merge([]);
    }
    const displayDataChanges = [
      this._database.dataChange,
      this._filterChange,
      this._sort.sortChange
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        return this.getFilteredData(this._database.data);
      }),
      map(data => {
        return this.getSortedData(data);
      })
    );
  }

  disconnect() {}

  getFilteredData(data): any[] {
    if (!this.filter) {
      return data;
    }
    return data.slice().filter((item: any) => {
      const searchStr: string = this._model.columns
        .filter(c => c.filterable)
        .map(c => ObjectUtils.resolve(item, c.name))
        .join(' ')
        .toLowerCase();

      return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
    });
  }

  getSortedData(data): any[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const propertyA: number | string = ObjectUtils.resolve(
        a,
        this._sort.active
      );
      const propertyB: number | string = ObjectUtils.resolve(
        b,
        this._sort.active
      );

      return ObjectUtils.naturalCompare(
        propertyB,
        propertyA,
        this._sort.direction
      );
    });
  }
}
