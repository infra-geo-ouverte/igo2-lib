import { SelectionModel } from '@angular/cdk/collections';
import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnInit,
  input,
  output,
  viewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { IgoLanguageModule } from '@igo2/core/language';
import { ObjectUtils } from '@igo2/utils';

import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { TableActionColor } from './table-action-color.enum';
import { TableDatabase } from './table-database';
import { TableDataSource } from './table-datasource';
import { TableModel } from './table-model.interface';

@Component({
  selector: 'igo-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    NgClass,
    MatButtonModule,
    MatIconModule,
    IgoLanguageModule
  ]
})
export class TableComponent implements OnChanges, OnInit, AfterViewInit {
  readonly database = input<TableDatabase>(undefined);
  readonly model = input<TableModel>(undefined);
  readonly hasFilterInput = input(true);

  public displayedColumns;
  public dataSource: TableDataSource | null;
  public selection = new SelectionModel<any>(true, []);

  readonly select = output<{
    added: any[];
    removed: any[];
    source: SelectionModel<any>;
  }>();

  readonly filter = viewChild<ElementRef>('filter');
  readonly sort = viewChild(MatSort);

  ngOnInit() {
    const model = this.model();
    this.dataSource = new TableDataSource(this.database(), model, this.sort());

    if (model) {
      this.displayedColumns = model.columns
        .filter((c) => c.displayed !== false)
        .map((c) => c.name);

      if (model.selectionCheckbox) {
        this.displayedColumns.unshift('selectionCheckbox');
      }
      if (model.actions && model.actions.length) {
        this.displayedColumns.push('action');
      }
    }

    this.selection.changed.subscribe((e) => this.select.emit(e));
  }

  ngAfterViewInit() {
    const filter = this.filter();
    if (filter) {
      fromEvent(filter.nativeElement, 'keyup')
        .pipe(debounceTime(150), distinctUntilChanged())
        .subscribe(() => {
          if (!this.dataSource) {
            return;
          }
          this.dataSource.filter = this.filter().nativeElement.value;
        });
    }
  }

  ngOnChanges(change) {
    if (change.database) {
      this.dataSource = new TableDataSource(
        this.database(),
        this.model(),
        this.sort()
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
    const numRows = this.database().data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.database().data.forEach((row) => this.selection.select(row));
  }

  handleClickAction(event, action, row) {
    event.stopPropagation();
    action.click(row);
  }
}
