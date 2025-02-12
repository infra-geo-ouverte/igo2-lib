import { FocusMonitor } from '@angular/cdk/a11y';
import { AsyncPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Self,
  SimpleChanges,
  TrackByFunction
} from '@angular/core';
import {
  FormControlName,
  FormsModule,
  NgControl,
  NgForm,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup
} from '@angular/forms';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  DateAdapter,
  ErrorStateMatcher,
  MatNativeDateModule,
  MatOptionModule
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatFormFieldControl,
  MatFormFieldModule
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SanitizeHtmlPipe } from '@igo2/common/custom-html';
import { ImageErrorDirective, SecureImagePipe } from '@igo2/common/image';
import { StopPropagationDirective } from '@igo2/common/stop-propagation';
import { IgoLanguageModule } from '@igo2/core/language';
import { StringUtils } from '@igo2/utils';

import { default as moment } from 'moment';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

import { EntityTablePaginatorComponent } from '../entity-table-paginator/entity-table-paginator.component';
import { EntityTablePaginatorOptions } from '../entity-table-paginator/entity-table-paginator.interface';
import {
  EntityKey,
  EntityRecord,
  EntityState,
  EntityStore,
  EntityTableColumn,
  EntityTableColumnRenderer,
  EntityTableScrollBehavior,
  EntityTableSelectionState,
  EntityTableTemplate
} from '../shared';
import { EntityTableRowDirective } from './entity-table-row.directive';

type CellData = Record<
  string,
  {
    value: any;
    class: Record<string, boolean>;
    isUrl: boolean;
    isImg: boolean;
  }
>;

interface RowData {
  record: EntityRecord<object, EntityState>;
  cellData: CellData;
}

@Component({
    selector: 'igo-entity-table',
    templateUrl: './entity-table.component.html',
    styleUrls: ['./entity-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: MatFormFieldControl, useExisting: EntityTableComponent },
        provideMomentDateAdapter()
    ],
    imports: [
        AsyncPipe,
        EntityTablePaginatorComponent,
        EntityTableRowDirective,
        FormsModule,
        ImageErrorDirective,
        MatAutocompleteModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatNativeDateModule, // For the DateAdapter provider
        MatOptionModule,
        MatSelectModule,
        MatSortModule,
        MatTableModule,
        MatTooltipModule,
        NgClass,
        NgFor,
        NgIf,
        NgStyle,
        ReactiveFormsModule,
        SanitizeHtmlPipe,
        SecureImagePipe,
        StopPropagationDirective,
        IgoLanguageModule
    ]
})
export class EntityTableComponent implements OnInit, OnChanges, OnDestroy {
  entitySortChange$ = new BehaviorSubject<boolean>(false);

  public formGroup: UntypedFormGroup = new UntypedFormGroup({});

  public filteredOptions = {};

  /**
   * Reference to the column renderer types
   * @internal
   */
  entityTableColumnRenderer = EntityTableColumnRenderer;

  /**
   * Reference to the selection's state
   * @internal
   */
  entityTableSelectionState = EntityTableSelectionState;

  /**
   * Observable of the selection,s state
   * @internal
   */
  readonly selectionState$ = new BehaviorSubject<EntityTableSelectionState>(
    undefined
  );

  /**
   * Subscription to the store's selection
   */
  private selection$$: Subscription;

  /**
   * Subscription to the dataSource
   */
  private dataSource$$: Subscription;

  /**
   * The last record checked. Useful for selecting
   * multiple records by holding the shift key and checking
   * checkboxes.
   */
  private lastRecordCheckedKey: EntityKey;

  /**
   * Entity store
   */
  @Input() store: EntityStore<object>;

  /**
   * Table paginator
   */
  @Input() set paginator(value: MatPaginator) {
    this._paginator = value;
    this.dataSource.paginator = value;
  }

  get paginator(): MatPaginator {
    return this._paginator;
  }
  private _paginator: MatPaginator;

  /**
   * Table template
   */
  @Input() template: EntityTableTemplate;

  /**
   * Scroll behavior on selection
   */
  @Input()
  scrollBehavior: EntityTableScrollBehavior = EntityTableScrollBehavior.Auto;

  /**
   * Whether nulls should be first when sorting
   */
  @Input()
  sortNullsFirst = false;

  /**
   * Show the table paginator or not. False by default.
   */
  @Input()
  withPaginator = false;

  /**
   * Paginator options
   */
  @Input()
  paginatorOptions: EntityTablePaginatorOptions;

  /**
   * Event emitted when an entity (row) is clicked
   */
  @Output() entityClick = new EventEmitter<object>();

  /**
   * Event emitted when an entity (row) is selected
   */
  @Output() entitySelectChange = new EventEmitter<{
    added: object[];
  }>();

  /**
   * Event emitted when the table sort is changed.
   */
  @Output() entitySortChange = new EventEmitter<{
    column: EntityTableColumn;
    direction: string;
  }>(undefined);

  /**
   * Table headers
   * @internal
   */
  get headers(): string[] {
    let columns = this.template.columns
      .filter((column: EntityTableColumn) => column.visible !== false)
      .map((column: EntityTableColumn) => column.name);

    if (this.selectionCheckbox === true) {
      columns = ['selectionCheckbox'].concat(columns);
    }

    return columns;
  }

  /**
   * Data source consumable by the underlying material table
   * @internal
   */
  dataSource = new MatTableDataSource<RowData>();

  /**
   * Whether selection is supported
   * @internal
   */
  get selection(): boolean {
    return this.template.selection || false;
  }

  /**
   * Whether a selection checkbox should be displayed
   * @internal
   */
  get selectionCheckbox(): boolean {
    return this.template.selectionCheckbox || false;
  }

  /**
   * Whether selection many entities should eb supported
   * @internal
   */
  get selectMany(): boolean {
    return this.template.selectMany || false;
  }

  /**
   * Whether selection many entities should eb supported
   * @internal
   */
  get fixedHeader(): boolean {
    return this.template.fixedHeader === undefined
      ? true
      : this.template.fixedHeader;
  }

  get tableHeight(): string {
    return this.template.tableHeight ? this.template.tableHeight : 'auto';
  }

  constructor(
    private cdRef: ChangeDetectorRef,
    private formBuilder: UntypedFormBuilder,
    protected _focusMonitor: FocusMonitor,
    protected _elementRef: ElementRef<HTMLElement>,
    @Optional() @Self() public ngControl: NgControl,
    @Optional() protected _parentForm: NgForm,
    @Optional() protected _controlName: FormControlName,
    protected _defaultErrorStateMatcher: ErrorStateMatcher,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('fr-CA');
  }

  /**
   * Track the selection state to properly display the selection checkboxes
   * @internal
   */
  ngOnInit() {
    this.handleDatasource();
    this.dataSource.paginator = this.paginator;
    this.store.state.change$.pipe(debounceTime(100)).subscribe(() => {
      this.handleDatasource();
      this.refresh();
    });
  }

  /**
   * @internal
   */
  ngOnChanges(changes: SimpleChanges) {
    const store = changes.store;
    if (store && store.currentValue !== store.previousValue) {
      this.handleDatasource();
    }
  }

  /**
   * Process text or number value change (edition)
   */
  onValueChange(column: string, record: EntityRecord<any>, event) {
    const key = this.getColumnKeyWithoutPropertiesTag(column);
    record.entity.properties[key] = event.target.value;
  }

  /**
   * Process boolean value change (edition)
   */
  onBooleanValueChange(column: string, record: EntityRecord<any>, event) {
    const key = this.getColumnKeyWithoutPropertiesTag(column);
    record.entity.properties[key] = event.checked;
  }

  /**
   * Process select value change (edition)
   */
  onSelectValueChange(column: string, record: EntityRecord<any>, event) {
    const key = this.getColumnKeyWithoutPropertiesTag(column);
    record.entity.properties[key] = event.value;
  }

  /**
   * Process autocomplete value change (edition)
   */
  onAutocompleteValueChange(
    column: EntityTableColumn,
    record: EntityRecord<any>,
    event
  ) {
    this.formGroup.controls[column.name].setValue(event.option.viewValue);
    const key = this.getColumnKeyWithoutPropertiesTag(column.name);
    record.entity.properties[key] = event.option.value;
  }

  /**
   * Process date value change (edition)
   */
  onDateChange(column: string, record: EntityRecord<any>, event) {
    const format = 'YYYY-MM-DD';
    const value = moment(event.value).format(format);
    const key = this.getColumnKeyWithoutPropertiesTag(column);
    record.entity.properties[key] = value;
  }

  /**
   * Enable edition mode for one row
   * More than one row can be edited at the same time
   */
  private enableEdit(record: EntityRecord<any>) {
    const item = record.entity.properties || record.entity;
    this.template.columns.forEach((column) => {
      column.title =
        column.validation?.mandatory && !column.title.includes('*')
          ? column.title + ' *'
          : column.title;

      const key = this.getColumnKeyWithoutPropertiesTag(column.name);
      if (column.type === 'boolean') {
        if (!item[key] || item[key] === null) {
          item[key] = false;
        } else if (typeof item[key] === 'string') {
          item[key] = JSON.parse(item[key].toLowerCase());
        }
        this.formGroup.setControl(
          column.name,
          this.formBuilder.control(item[key])
        );
      } else if (column.type === 'list') {
        if (column.multiple) {
          this.formGroup.setControl(
            column.name,
            this.formBuilder.control([item[key]])
          );
        } else {
          this.formGroup.setControl(
            column.name,
            this.formBuilder.control(item[key])
          );

          typeof item[key] === 'string'
            ? this.formGroup.controls[column.name].setValue(parseInt(item[key]))
            : this.formGroup.controls[column.name].setValue(item[key]);
        }
      } else if (column.type === 'autocomplete') {
        this.formGroup.setControl(
          column.name,
          this.formBuilder.control(item[key])
        );

        this.filteredOptions[column.name] = new Observable<any[]>();
        this.filteredOptions[column.name] = this.formGroup.controls[
          column.name
        ].valueChanges.pipe(
          map((value) => {
            if (value?.length) {
              return column.domainValues?.filter((option) => {
                const filterNormalized = value
                  ? value
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                  : '';
                const featureNameNormalized = option.value
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '');
                return featureNameNormalized.includes(filterNormalized);
              });
            }
          })
        );

        let formControlValue = item[key];
        column.domainValues.forEach((option) => {
          if (
            typeof formControlValue === 'string' &&
            StringUtils.isValidNumber(formControlValue) &&
            !StringUtils.isOctalNumber(formControlValue)
          ) {
            formControlValue = parseInt(formControlValue);
          }
          if (
            option.value === formControlValue ||
            option.id === formControlValue
          ) {
            formControlValue = option.value;
          }
        });

        this.formGroup.controls[column.name].setValue(formControlValue);
        if (this.isEdition(record) && column.linkColumnForce) {
          const entity = record.entity as any;
          this.formGroup.controls[column.name].setValue(
            entity?.properties[
              this.getColumnKeyWithoutPropertiesTag(column.linkColumnForce)
            ]
          );
        }
      } else if (column.type === 'date') {
        if (column.visible !== false) {
          if (item[key]) {
            const date = moment(item[key]);
            item[key] = date.utc().format('YYYY-MM-DD');
            this.formGroup.setControl(
              column.name,
              this.formBuilder.control(item[key])
            );
          } else {
            const newKey = this.getColumnKeyWithoutPropertiesTag(column.name);
            record.entity.properties[newKey] = null;
            this.formGroup.setControl(
              column.name,
              this.formBuilder.control(null)
            );
          }
        }
      } else {
        this.formGroup.setControl(
          column.name,
          this.formBuilder.control(item[key])
        );
      }

      if (
        this.formGroup.controls[column.name] &&
        this.getValidationAttributeValue(column, 'readonly')
      ) {
        this.formGroup.controls[column.name].disable();
      }
    });
  }

  private handleDatasource() {
    this.unsubscribeStore();
    this.selection$$ = this.store.stateView
      .manyBy$((record: EntityRecord<object>) => record.state.selected === true)
      .subscribe((records: EntityRecord<object>[]) => {
        const firstSelected = records[0];
        const firstSelectedStateviewPosition = this.store.stateView
          .all()
          .indexOf(firstSelected);
        const pageMax = this.paginator
          ? this.paginator.pageSize * (this.paginator.pageIndex + 1)
          : 0;
        const pageMin = this.paginator ? pageMax - this.paginator.pageSize : 0;

        if (
          this.paginator &&
          (firstSelectedStateviewPosition < pageMin ||
            firstSelectedStateviewPosition >= pageMax)
        ) {
          const pageToReach = Math.floor(
            firstSelectedStateviewPosition / this.paginator.pageSize
          );
          this.dataSource.paginator.pageIndex = pageToReach;
        }
        this.selectionState$.next(this.computeSelectionState(records));
      });
    this.dataSource$$ = this.store.stateView.all$().subscribe((all) => {
      if (all[0]) {
        this.enableEdit(all[0]);
      }
      this.dataSource.data = all.map((record) => {
        return {
          record,
          cellData: this.template.columns.reduce(
            (cellData: CellData, column) => {
              const value = this.getValue(record, column);
              cellData[column.name] = {
                class: this.getCellClass(record, column),
                value,
                isUrl: this.isUrl(value),
                isImg: this.isImg(value)
              };
              return cellData;
            },
            {}
          )
        };
      });
    });
  }

  /**
   * Unbind the store watcher
   * @internal
   */
  ngOnDestroy() {
    this.unsubscribeStore();
  }

  private unsubscribeStore() {
    if (this.selection$$) {
      this.selection$$.unsubscribe();
    }
    if (this.dataSource$$) {
      this.dataSource$$.unsubscribe();
    }
  }

  /**
   * Trackby function
   * @param record Record
   * @param index Record index
   * @internal
   */
  getTrackByFunction(): TrackByFunction<RowData> {
    return (_index, row) => row.record.ref;
  }
  /**
   * Trigger a refresh of the table. This can be useful when
   * the data source doesn't emit a new value but for some reason
   * the records need an update.
   * @internal
   */
  refresh() {
    this.cdRef.detectChanges();
  }

  paginatorChange(event: MatPaginator) {
    this.paginator = event;
  }

  /**
   * On sort, sort the store
   * @param event Sort event
   * @internal
   */
  onSort(event: { active: string; direction: string }) {
    const direction = event.direction;
    const column = this.template.columns.find(
      (c: EntityTableColumn) => c.name === event.active
    );

    if (direction === 'asc' || direction === 'desc') {
      this.store.stateView.sort({
        valueAccessor: (record: EntityRecord<object>) =>
          this.getValue(record, column),
        direction,
        nullsFirst: this.sortNullsFirst
      });
      this.entitySortChange.emit({ column, direction });
      this.entitySortChange$.next(true);
    } else {
      this.store.stateView.sort(undefined);
    }
  }

  /**
   * When an entity is clicked, emit an event
   * @param record Record
   * @internal
   */
  onRowClick(record: EntityRecord<object>) {
    this.lastRecordCheckedKey = this.store.stateView.getKey(record);
    this.entityClick.emit(record.entity);
  }

  /**
   * When an entity is selected, select it in the store and emit an event. Even if
   * "many" is set to true, this method always select a single, exclusive row. Selecting
   * multiple rows should be achieved by using the checkboxes.
   * @param record Record
   * @internal
   */
  onRowSelect(record: EntityRecord<object>) {
    if (this.selection === false) {
      return;
    }

    const entity = record.entity;
    this.store.state.update(entity, { selected: true }, true);
    this.entitySelectChange.emit({ added: [entity] });
  }

  /**
   * Select or unselect all rows at once. On select, emit an event.
   * @param toggle Select or unselect
   * @internal
   */
  onToggleRows(toggle: boolean) {
    if (this.selection === false) {
      return;
    }

    const entities = this.store.view.all();
    this.entitySelectChange.emit({ added: [entities] });
    this.store.state.updateMany(entities, { selected: toggle });
  }

  /**
   * When an entity is toggled, select or unselect it in the store. On select,
   * emit an event.
   * @param toggle Select or unselect
   * @param record Record
   * @internal
   */
  onToggleRow(toggle: boolean, record: EntityRecord<object>) {
    if (this.selection === false) {
      return;
    }

    const entity = record.entity;
    const exclusive = toggle === true && !this.selectMany;
    this.store.state.update(entity, { selected: toggle }, exclusive);
    if (toggle === true) {
      this.entitySelectChange.emit({ added: [entity] });
    }
    this.lastRecordCheckedKey = this.store.stateView.getKey(record);
  }

  /**
   * When an entity is toggled, select or unselect it in the store. On select,
   * emit an event.
   * @param toggle Select or unselect
   * @param record Record
   * @internal
   */
  onShiftToggleRow(
    toggle: boolean,
    record: EntityRecord<object>,
    event: MouseEvent
  ) {
    if (this.selection === false) {
      return;
    }

    if (this.selectMany === false || this.lastRecordCheckedKey === undefined) {
      this.onToggleRow(toggle, record);
      return;
    }

    // This is a workaround mat checkbox wrong behavior
    // when the shift key is held.
    // See https://github.com/angular/components/issues/6232
    const range = window.document.createRange();
    range.selectNode(event.target as HTMLElement);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    event.stopImmediatePropagation();

    const records = this.store.stateView.all();
    const recordIndex = records.indexOf(record);
    const lastRecordChecked = this.store.stateView.get(
      this.lastRecordCheckedKey
    );
    const lastRecordIndex = records.indexOf(lastRecordChecked);
    const indexes = [recordIndex, lastRecordIndex];
    const selectRecords = records.slice(
      Math.min(...indexes),
      Math.max(...indexes) + 1
    );

    const entities = selectRecords.map(
      (_record: EntityRecord<object>) => _record.entity
    );
    this.store.state.updateMany(entities, { selected: toggle });
    if (toggle === true) {
      this.entitySelectChange.emit({ added: entities });
    }
    this.lastRecordCheckedKey = this.store.stateView.getKey(record);
  }

  /**
   * Compute the selection state
   * @returns Whether all, some or no rows are selected
   * @internal
   */
  private computeSelectionState(
    selectedRecords: EntityRecord<object>[]
  ): EntityTableSelectionState {
    const states = EntityTableSelectionState;
    const selectionCount = selectedRecords.length;
    return selectionCount === 0
      ? states.None
      : selectionCount === this.store.stateView.count
        ? states.All
        : states.Some;
  }

  /**
   * Whether a column is sortable
   * @param column Column
   * @returns True if a column is sortable
   * @internal
   */
  columnIsSortable(column: EntityTableColumn): boolean {
    let sortable = column.sort;
    if (sortable === undefined) {
      sortable = this.template.sort === undefined ? false : this.template.sort;
    }
    return sortable;
  }

  /**
   * Whether a row is should be selected based on the underlying entity state
   * @param record Record
   * @returns True if a row should be selected
   * @internal
   */
  rowIsSelected(record: EntityRecord<object>): boolean {
    const state = record.state;
    return state.selected ? state.selected : false;
  }

  isImg(value) {
    if (this.isUrl(value)) {
      return (
        ['jpg', 'png', 'gif'].indexOf(value.split('.').pop().toLowerCase()) !==
        -1
      );
    } else {
      return false;
    }
  }

  isUrl(value) {
    if (typeof value === 'string') {
      return (
        value.slice(0, 8) === 'https://' || value.slice(0, 7) === 'http://'
      );
    } else {
      return false;
    }
  }

  /**
   * Method to access an entity's values
   * @param record Record
   * @param column Column
   * @returns Any value
   * @internal
   */
  getValue(record: EntityRecord<object>, column: EntityTableColumn): any {
    const entity = record.entity;
    let value;
    if (column.valueAccessor !== undefined) {
      return column.valueAccessor(entity, record);
    }
    if (this.template.valueAccessor !== undefined) {
      return this.template.valueAccessor(entity, column.name, record);
    }
    value = this.store.getProperty(entity, column.name);

    if (column.type === 'boolean') {
      if (value === undefined || value === null || value === '') {
        value = false;
      } else if (typeof value !== 'boolean' && value !== undefined) {
        if (typeof value === 'number') {
          value = Boolean(value);
        } else {
          value = JSON.parse(value.toLowerCase());
        }
      }
      if (!this.isEdition(record)) {
        value = value ? '&#10003;' : ''; // check mark
      }
    } else if (column.type === 'list' && value && column.domainValues) {
      const entity = record.entity as any;
      if (column.multiple) {
        let list_id;
        typeof value === 'string'
          ? (list_id = value.match(/[\w.-]+/g).map(Number))
          : (list_id = value);
        const list_option = [];

        column.domainValues.forEach((option) => {
          if (list_id.includes(option.id)) {
            if (record.edition) {
              list_option.push(option.id);
            } else {
              list_option.push(option.value);
            }
          }
        });

        this.isEdition(record) ? (value = list_id) : (value = list_option);
      } else {
        if (!this.isEdition(record) && column.linkColumnForce) {
          value =
            entity?.properties[
              this.getColumnKeyWithoutPropertiesTag(column.linkColumnForce)
            ];
        } else {
          column.domainValues.forEach((option) => {
            if (
              typeof value === 'string' &&
              StringUtils.isValidNumber(value) &&
              !StringUtils.isOctalNumber(value)
            ) {
              value = parseInt(value);
            }
            if (option.value === value || option.id === value) {
              this.isEdition(record)
                ? (value = option.id)
                : (value = option.value);
            }
          });
        }
      }
    } else if (column.type === 'autocomplete' && value && column.domainValues) {
      const entity = record.entity as any;
      if (!this.isEdition(record) && column.linkColumnForce) {
        value =
          entity?.properties[
            this.getColumnKeyWithoutPropertiesTag(column.linkColumnForce)
          ];
      } else {
        column.domainValues.forEach((option) => {
          if (
            typeof value === 'string' &&
            StringUtils.isValidNumber(value) &&
            !StringUtils.isOctalNumber(value)
          ) {
            value = parseInt(value);
          }
          if (option.value === value || option.id === value) {
            value = option.value;
          }
        });
      }
    } else if (column.type === 'date') {
      if (this.isEdition(record)) {
        if (value) {
          const date = moment(value);
          value = date.format();
          this.formGroup.controls[column.name].setValue(value);
        }
      } else if (!this.isEdition(record) && value === null) {
        value = '';
      }
    }

    if (value === undefined) {
      value = '';
    }

    return value;
  }

  /**
   * Method to access an entity's validation values
   * @param column Column
   * @param validationType string
   * @returns Any value (false if no validation or not the one concerned)
   * @internal
   */
  getValidationAttributeValue(
    column: EntityTableColumn,
    validationType: string
  ): any {
    if (
      column.validation !== undefined &&
      column.validation[validationType] !== undefined
    ) {
      return column.validation[validationType];
    } else {
      return false;
    }
  }

  public isEdition(record) {
    return record.entity.edition ? true : false;
  }

  /**
   * Return the type of renderer of a column
   * @param column Column
   * @returns Renderer type
   * @internal
   */
  getColumnRenderer(column: EntityTableColumn): EntityTableColumnRenderer {
    if (column.renderer !== undefined) {
      return column.renderer;
    }
    return EntityTableColumnRenderer.Default;
  }

  /**
   * Return the table ngClass
   * @returns ngClass
   * @internal
   */
  getTableClass(): Record<string, boolean> {
    return {
      'igo-entity-table-with-selection': this.selection
    };
  }

  /**
   * Return a header ngClass
   * @returns ngClass
   * @internal
   */
  getHeaderClass(): Record<string, boolean> {
    const func = this.template.headerClassFunc;
    if (func instanceof Function) {
      return func();
    }
    return {};
  }

  /**
   * Return a row ngClass
   * @param record Record
   * @returns ngClass
   * @internal
   */
  getRowClass(record: EntityRecord<object>): Record<string, boolean> {
    const entity = record.entity;
    const func = this.template.rowClassFunc;
    if (func instanceof Function) {
      return func(entity, record);
    }
    return {};
  }

  /**
   * Return a row ngClass
   * @param record Record
   * @param column Column
   * @returns ngClass
   * @internal
   */
  getCellClass(
    record: EntityRecord<object>,
    column: EntityTableColumn
  ): Record<string, boolean> {
    const entity = record.entity;
    const cls = {};

    const tableFunc = this.template.cellClassFunc;
    if (tableFunc instanceof Function) {
      Object.assign(cls, tableFunc(entity, column, record));
    }

    const columnFunc = column.cellClassFunc;
    if (columnFunc instanceof Function) {
      Object.assign(cls, columnFunc(entity, record));
    }

    return cls;
  }

  /**
   * When a button is clicked
   * @param func Function
   * @param record Record
   * @internal
   */
  onButtonClick(
    clickFunc: (entity: object, record?: EntityRecord<object>) => void,
    record: EntityRecord<object>
  ) {
    this.enableEdit(record);
    if (typeof clickFunc === 'function') {
      clickFunc(record.entity, record);
    }
  }

  /**
   * Retrieve column name without his "properties" tag (useful for edition workspace properties)
   */
  public getColumnKeyWithoutPropertiesTag(column: string) {
    if (column.includes('properties.')) {
      return column.split('.')[1];
    }
    return column;
  }
}
