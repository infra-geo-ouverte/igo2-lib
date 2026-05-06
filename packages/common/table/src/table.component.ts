import { SelectionModel } from '@angular/cdk/collections';
import { NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  afterNextRender,
  computed,
  effect,
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
export class TableComponent {
  readonly database = input.required<TableDatabase>();
  readonly model = input.required<TableModel>();
  readonly hasFilterInput = input(true);

  public selection = new SelectionModel<any>(true, []);

  readonly select = output<{
    added: any[];
    removed: any[];
    source: SelectionModel<any>;
  }>();

  readonly filter = viewChild<ElementRef>('filter');
  readonly sort = viewChild(MatSort);

  readonly displayedColumns = computed(() => {
    const model = this.model();
    const cols = model.columns
      .filter((c) => c.displayed !== false)
      .map((c) => c.name);
    if (model.selectionCheckbox) {
      cols.unshift('selectionCheckbox');
    }
    if (model.actions?.length) {
      cols.push('action');
    }
    return cols;
  });

  readonly dataSource = computed(
    () => new TableDataSource(this.database(), this.model())
  );

  constructor() {
    effect(() => {
      this.dataSource().sort = this.sort();
    });

    this.selection.changed.subscribe((e) => this.select.emit(e));

    afterNextRender(() => {
      const filter = this.filter();
      if (filter) {
        fromEvent(filter.nativeElement, 'keyup')
          .pipe(debounceTime(150), distinctUntilChanged())
          .subscribe(() => {
            this.dataSource().filter = filter.nativeElement.value;
          });
      }
    });
  }

  getActionColor(colorId: number): string {
    return TableActionColor[colorId];
  }

  getValue(row: any, key: string): any {
    return ObjectUtils.resolve(row, key);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const database = this.database();
    const numRows = database ? database.data.length : 0;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    const database = this.database();
    if (!database) {
      return;
    }
    this.isAllSelected()
      ? this.selection.clear()
      : database.data.forEach((row) => this.selection.select(row));
  }

  handleClickAction(event: MouseEvent, action: any, row: any) {
    event.stopPropagation();
    action.click(row);
  }
}
