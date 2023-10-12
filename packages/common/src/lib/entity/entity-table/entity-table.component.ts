import { FocusMonitor } from '@angular/cdk/a11y';
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
  FormControl,
  FormControlName,
  NgControl,
  NgForm,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { DateAdapter, ErrorStateMatcher } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { default as moment } from 'moment';
import { BehaviorSubject, Subscription } from 'rxjs';

import { EntityTablePaginatorOptions } from '../entity-table-paginator/entity-table-paginator.interface';
import {
  EntityKey,
  EntityRecord,
  EntityStore,
  EntityTableColumn,
  EntityTableColumnRenderer,
  EntityTableScrollBehavior,
  EntityTableSelectionState,
  EntityTableTemplate,
  getColumnKeyWithoutPropertiesTag
} from '../shared';

@Component({
  selector: 'igo-entity-table',
  templateUrl: './entity-table.component.html',
  styleUrls: ['./entity-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: MatFormFieldControl, useExisting: EntityTableComponent }
  ]
})
export class EntityTableComponent implements OnInit, OnChanges, OnDestroy {
  entitySortChange$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  visibleColumns: EntityTableColumn[];
  columnToDisplay: string[];

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
  readonly selectionState$: BehaviorSubject<EntityTableSelectionState> =
    new BehaviorSubject(undefined);

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
  @Input() set template(value: EntityTableTemplate) {
    this._template = value;
    this.visibleColumns = value.columns.filter(
      (column) => column.visible !== false
    );
    this.columnToDisplay = this.getColumnToDisplay();
  }
  get template(): EntityTableTemplate {
    return this._template;
  }
  private _template: EntityTableTemplate;

  /**
   * Scroll behavior on selection
   */
  @Input()
  scrollBehavior: EntityTableScrollBehavior = EntityTableScrollBehavior.Auto;

  /**
   * Whether nulls should be first when sorting
   */
  @Input()
  sortNullsFirst: boolean = false;

  /**
   * Show the table paginator or not. False by default.
   */
  @Input()
  withPaginator: boolean = false;

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
  @Output() entitySortChange: EventEmitter<{
    column: EntityTableColumn;
    direction: string;
  }> = new EventEmitter(undefined);

  /**
   * Data source consumable by the underlying material table
   * @internal
   */
  dataSource = new MatTableDataSource<EntityRecord<object>>();

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
    this.handleStore();
    this.dataSource.paginator = this.paginator;
  }

  /**
   * @internal
   */
  ngOnChanges(changes: SimpleChanges) {
    const store = changes.store;
    if (store && store.currentValue !== store.previousValue) {
      this.handleStore();
    }
  }

  private getColumnToDisplay(): string[] {
    const columns = this.visibleColumns.map((column) => column.name);

    if (this.selectionCheckbox === true) {
      columns.unshift('selectionCheckbox');
    }

    return columns;
  }

  /**
   * Process text or number value change (edition)
   */
  onChange(
    column: EntityTableColumn,
    record: EntityRecord<any>,
    value: unknown
  ) {
    const key = getColumnKeyWithoutPropertiesTag(column.name);
    record.entity.properties[key] = value;
  }

  onValueChange(column: EntityTableColumn, record: EntityRecord<any>, event) {
    this.onChange(column, record, event.target.value);
  }

  /**
   * Process boolean value change (edition)
   */
  onBooleanValueChange(
    column: EntityTableColumn,
    record: EntityRecord<any>,
    event: MatCheckboxChange
  ) {
    this.onChange(column, record, event.checked);
  }

  /**
   * Process select value change (edition)
   */
  onSelectValueChange(
    column: EntityTableColumn,
    record: EntityRecord<any>,
    value: unknown
  ) {
    this.onChange(column, record, value);
  }

  /**
   * Process autocomplete value change (edition)
   */
  onAutocompleteValueChange(
    column: EntityTableColumn,
    record: EntityRecord<any>,
    value: unknown
  ) {
    this.onChange(column, record, value);
  }

  /**
   * Process date value change (edition)
   */
  onDateChange(
    column: EntityTableColumn,
    record: EntityRecord<any>,
    event: MatDatepickerInputEvent<any>
  ) {
    const format = 'YYYY-MM-DD';
    const value = moment(event.value).format(format);

    this.onChange(column, record, value);
  }

  /**
   * Enable edition mode for one row
   * More than one row can be edited at the same time
   */
  enableEdition(record?: EntityRecord<any>) {
    this.buildForm(record);
  }

  private buildForm(record?: EntityRecord<any>) {
    const controlsConfig = this.visibleColumns.reduce((config, column) => {
      column.title =
        column.validation?.mandatory && !column.title.includes('*')
          ? column.title + ' *'
          : column.title;

      const key = getColumnKeyWithoutPropertiesTag(column.name);
      const item = record?.entity.properties || record?.entity;

      config[column.name] = this.createControlByColumnType(item?.[key], column);
      return config;
    }, {});

    this.formGroup = this.formBuilder.group(controlsConfig);
  }

  private createControlByColumnType(value: unknown, column: EntityTableColumn) {
    switch (column.type) {
      case 'boolean':
        return this.createBooleanControl(value as string, column);
      case 'list':
      case 'autocomplete':
        return this.createBaseControl(value, column);
      case 'date':
        return this.createDateControl(value, column);

      default:
        return this.createBaseControl(value, column);
    }
  }

  private createBooleanControl(
    value: string | boolean,
    column: EntityTableColumn
  ): FormControl {
    if (!value || value === null) {
      value = false;
    } else if (typeof value === 'string') {
      value = JSON.parse(value.toLowerCase());
    }
    return this.createBaseControl(value, column);
  }

  private createDateControl(
    value: unknown,
    column: EntityTableColumn
  ): FormControl {
    if (value) {
      let date = moment(value);
      value = date.utc().format('YYYY-MM-DD');
    }
    return this.createBaseControl(value, column);
  }

  private createBaseControl(
    value: unknown,
    column: EntityTableColumn
  ): FormControl {
    return new FormControl(
      {
        value,
        disabled: this.getValidationAttributeValue(column, 'readonly')
      },
      [
        this.getValidationAttributeValue(column, 'mandatory') &&
          Validators.required
      ].filter(Boolean)
    );
  }

  private handleStore() {
    this.unsubscribeStore();

    this.selection$$ = this.handleSelection();
    this.dataSource$$ = this.handleDatasource();
  }

  private handleDatasource(): Subscription {
    return this.store.stateView.all$().subscribe((all) => {
      this.dataSource.data = all;
      this.cdRef.markForCheck();
    });
  }

  private handleSelection(): Subscription {
    return this.store.stateView
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
        this.cdRef.markForCheck();
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
   * Trigger a refresh of thre table. This can be useful when
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

    this.store.state.updateAll({ selected: toggle });
    if (toggle === true) {
      const entities = this.store.stateView
        .all()
        .map((record: EntityRecord<object>) => record.entity);
      this.entitySelectChange.emit({ added: [entities] });
    }
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

  /**
   * Method to access an entity's values
   * @param record Record
   * @param column Column
   * @returns Any value
   * @internal
   */
  getValue(record: EntityRecord<object>, column: EntityTableColumn): any {
    const entity = record.entity;
    if (column.valueAccessor !== undefined) {
      return column.valueAccessor(entity, record);
    }
    if (this.template.valueAccessor !== undefined) {
      return this.template.valueAccessor(entity, column.name, record);
    }

    let value = this.store.getProperty(entity, column.name);
    if (column.type === 'boolean') {
      value = this.getBooleanValue(value, record);
    } else if (column.type === 'date') {
      value = this.getDateValue(value, record);
    }

    if (value === undefined) {
      value = '';
    }

    return value;
  }

  private getDateValue(
    value: string | number,
    record: EntityRecord<object>
  ): string | number {
    if (value && this.isEdition(record)) {
      let date = moment(value);
      value = date.format();
    } else if (!this.isEdition(record) && value === null) {
      value = '';
    }
    return value;
  }

  private getBooleanValue(
    value: string | number | boolean,
    record: EntityRecord<object>
  ): string | number | boolean {
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
  getTableClass(): { [key: string]: boolean } {
    return {
      'igo-entity-table-with-selection': this.selection
    };
  }

  /**
   * Return a header ngClass
   * @returns ngClass
   * @internal
   */
  getHeaderClass(): { [key: string]: boolean } {
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
  getRowClass(record: EntityRecord<object>): { [key: string]: boolean } {
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
  ): { [key: string]: boolean } {
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
    clickFunc: (record: EntityRecord<object>) => void,
    record: EntityRecord<object>
  ) {
    this.enableEdition(record);
    if (typeof clickFunc === 'function') {
      clickFunc(record);
    }
  }

  rowTrackBy(): TrackByFunction<EntityRecord<object>> {
    return (_index, row) => row.ref;
  }

  columnTrackBy(): TrackByFunction<EntityTableColumn> {
    return (_index, column) => column.name;
  }
}
