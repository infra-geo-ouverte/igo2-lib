import { Component, ElementRef, ViewChild, Input,
  OnChanges, OnInit } from '@angular/core';
import { MatSort } from '@angular/material';

import { debounceTime } from 'rxjs/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { fromEvent } from 'rxjs/observable/fromEvent';

import { ObjectUtils } from '../../utils';

import { TableModel } from './table-model.interface';
import { TableDatabase } from './table-database';
import { TableDataSource } from './table-datasource';
import { TableActionColor } from './table-action-color.enum';


@Component({
  selector: 'igo-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.styl']
})
export class TableComponent implements OnChanges, OnInit {

  @Input()
  get database(): TableDatabase { return this._database; }
  set database(value: TableDatabase) {
    this._database = value;
  }
  private _database: TableDatabase;

  @Input()
  get model(): TableModel { return this._model; }
  set model(value: TableModel) {
    this._model = value;
  }
  private _model: TableModel;

  public displayedColumns;
  public dataSource: TableDataSource | null;

  @ViewChild('filter') filter: ElementRef;
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this.dataSource = new TableDataSource(this.database, this.model, this.sort);

    if (this.model) {
      this.displayedColumns = this.model.columns
        .filter((c) => c.displayed !== false)
        .map((c) => c.name);

      if (this.model.actions && this.model.actions.length) {
        this.displayedColumns.push('action');
      }
    }

    fromEvent(this.filter.nativeElement, 'keyup').pipe(
      debounceTime(150),
      distinctUntilChanged()
    ).subscribe(() => {
        if (!this.dataSource) { return; }
        this.dataSource.filter = this.filter.nativeElement.value;
      });
  }

  ngOnChanges(change) {
    if (change.database) {
      this.dataSource = new TableDataSource(this.database, this.model, this.sort);
    }
  }

  getActionColor(colorId: number): string {
    return TableActionColor[colorId];
  }

  getValue(row, key) {
    return ObjectUtils.resolve(row, key);
  }
}
