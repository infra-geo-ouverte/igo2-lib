import { DataSource } from '@angular/cdk/table';
import { MatSort } from '@angular/material/sort';

import { ObjectUtils } from '@igo2/utils';

import { BehaviorSubject, EMPTY, Observable, merge } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { TableDatabase } from './table-database';
import { TableModel } from './table-model.interface';

export class TableDataSource extends DataSource<any> {
  get filter(): string {
    return this._filterChange.value;
  }
  set filter(filter: string) {
    this._filterChange.next(filter);
  }
  private _filterChange = new BehaviorSubject('');

  private _sort$ = new BehaviorSubject<MatSort | undefined>(undefined);

  set sort(sort: MatSort | undefined) {
    this._sort$.next(sort);
  }

  constructor(
    private _database: TableDatabase,
    private _model: TableModel
  ) {
    super();
  }

  // Connect function called by the table to retrieve one stream containing
  // the data to render.
  connect(): Observable<any[]> {
    if (!this._database) {
      return merge([]);
    }
    const sortChange$ = this._sort$.pipe(
      switchMap((sort) => (sort ? sort.sortChange : EMPTY))
    );

    return merge(
      this._database.dataChange,
      this._filterChange,
      sortChange$
    ).pipe(
      map(() => this.getFilteredData(this._database.data)),
      map((data) => this.getSortedData(data))
    );
  }

  disconnect() {
    // empty
  }

  getFilteredData(data: any[]): any[] {
    if (!this.filter) {
      return data;
    }
    return data.slice().filter((item: any) => {
      const searchStr: string = this._model.columns
        .filter((c) => c.filterable)
        .map((c) => ObjectUtils.resolve(item, c.name))
        .join(' ')
        .toLowerCase();

      return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
    });
  }

  getSortedData(data: any[]): any[] {
    const sort = this._sort$.value;
    if (!sort || !sort.active || sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const propertyA: number | string = ObjectUtils.resolve(a, sort.active) as
        | number
        | string;
      const propertyB: number | string = ObjectUtils.resolve(b, sort.active) as
        | number
        | string;

      return ObjectUtils.naturalCompare(propertyB, propertyA, sort.direction);
    });
  }
}
