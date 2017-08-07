import { Component, ElementRef, ViewChild, Input,
  OnChanges, OnInit } from '@angular/core';
import { MdSort } from '@angular/material';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';

import { ObjectUtils } from '../../utils';

import { TableDataSource, TableDatabase,
  TableModel, TableActionColor } from './index';

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

  private displayedColumns;
  private dataSource: TableDataSource | null;

  @ViewChild('filter') filter: ElementRef;
  @ViewChild(MdSort) sort: MdSort;

  ngOnInit() {
    this.dataSource = new TableDataSource(this.database, this.model, this.sort);
    this.displayedColumns = this.model.columns
      .filter((c) => c.displayed !== false)
      .map((c) => c.name);
    if (this.model.actions && this.model.actions.length) {
      this.displayedColumns.push('action');
    }

    Observable.fromEvent(this.filter.nativeElement, 'keyup')
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
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
