import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  Output,
  OnChanges,
  OnInit,
  AfterViewInit,
  EventEmitter
} from '@angular/core';
import { MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { fromEvent } from 'rxjs';

import { ObjectUtils } from '@igo2/utils';

import { TableModel } from './table-model.interface';
import { TableDatabase } from './table-database';
import { TableDataSource } from './table-datasource';
import { TableActionColor } from './table-action-color.enum';

@Component({
  selector: 'igo-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnChanges, OnInit, AfterViewInit {
  @Input()
  get database(): TableDatabase {
    return this._database;
  }
  set database(value: TableDatabase) {
    this._database = value;
  }
  private _database: TableDatabase;

  @Input()
  get model(): TableModel {
    return this._model;
  }
  set model(value: TableModel) {
    this._model = value;
  }
  private _model: TableModel;

  @Input()
  get hasFilterInput(): boolean {
    return this._hasFIlterInput;
  }
  set hasFilterInput(value: boolean) {
    this._hasFIlterInput = value;
  }
  private _hasFIlterInput = true;

  public displayedColumns;
  public dataSource: TableDataSource | null;
  public selection = new SelectionModel<any>(true, []);

  @Output()
  select = new EventEmitter<{
    added: any[];
    removed: any[];
    source: SelectionModel<any>;
  }>();

  @ViewChild('filter') filter: ElementRef;
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this.dataSource = new TableDataSource(this.database, this.model, this.sort);

    if (this.model) {
      this.displayedColumns = this.model.columns
        .filter(c => c.displayed !== false)
        .map(c => c.name);

      if (this.model.selectionCheckbox) {
        this.displayedColumns.unshift('selectionCheckbox');
      }
      if (this.model.actions && this.model.actions.length) {
        this.displayedColumns.push('action');
      }
    }

    this.selection.onChange.subscribe(e => this.select.emit(e));
  }

  ngAfterViewInit() {
    if (this.filter) {
      fromEvent(this.filter.nativeElement, 'keyup')
        .pipe(
          debounceTime(150),
          distinctUntilChanged()
        )
        .subscribe(() => {
          if (!this.dataSource) {
            return;
          }
          this.dataSource.filter = this.filter.nativeElement.value;
        });
    }
  }

  ngOnChanges(change) {
    if (change.database) {
      this.dataSource = new TableDataSource(
        this.database,
        this.model,
        this.sort
      );
      this.selection.clear();
    }
  }

  getActionColor(colorId: number): string {
    return TableActionColor[colorId];
  }

  getValue(row, key) {
    return ObjectUtils.resolve(row, key);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.database.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.database.data.forEach(row => this.selection.select(row));
  }

  handleClickAction(event, action, row) {
    event.stopPropagation();
    action.click(row);
  }
}
