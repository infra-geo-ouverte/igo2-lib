import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  SimpleChanges,
  OnInit,
  OnDestroy,
  OnChanges
} from '@angular/core';

import { BehaviorSubject, Subscription } from 'rxjs';

import {
  EntityRecord,
  EntityStore,
  EntityStoreWatcher,
  EntityTableTemplate,
  EntityTableColumn,
  EntityTableColumnRenderer,
  EntityTableSelectionState,
  EntityTableScrollBehavior
} from '../shared';

@Component({
  selector: 'igo-entity-table',
  templateUrl: './entity-table.component.html',
  styleUrls: ['./entity-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityTableComponent implements OnInit, OnDestroy, OnChanges  {

  /**
   * Reference to the column renderer types
   * @internal
   */
  entityTableColumnRenderer = EntityTableColumnRenderer;

  /**
   * Reference to the selection states
   * @internal
   */
  entityTableSelectionState = EntityTableSelectionState;

  /**
   * Observable of the selection,s state
   * @internal
   */
  selectionState$: BehaviorSubject<EntityTableSelectionState> = new BehaviorSubject(undefined);

  /**
   * Entity store watcher
   */
  private watcher: EntityStoreWatcher<object>;

  /**
   * Subscription to the store's selection
   */
  private selection$$: Subscription;

  /**
   * Entity store
   */
  @Input() store: EntityStore<object>;

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
  sortNullsFirst: boolean = false;

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
  get dataSource(): BehaviorSubject<object[]> { return this.store.view.all$(); }

  /**
   * Whether selection is supported
   * @internal
   */
  get selection(): boolean { return this.template.selection || false; }

  /**
   * Whether a selection checkbox should be displayed
   * @internal
   */
  get selectionCheckbox(): boolean { return this.template.selectionCheckbox || false; }

  /**
   * Whether selection many entities should eb supported
   * @internal
   */
  get selectMany(): boolean { return this.template.selectMany || false; }

  /**
   * Whether selection many entities should eb supported
   * @internal
   */
  get fixedHeader(): boolean { return this.template.fixedHeader === undefined ? true : this.template.fixedHeader; }

  constructor(private cdRef: ChangeDetectorRef) {}

  /**
   * Track the selection state to properly display the selection checkboxes
   * @internal
   */
  ngOnInit() {
    this.selection$$ = this.store.stateView
      .manyBy$((record: EntityRecord<object>) => record.state.selected === true)
      .subscribe((records: EntityRecord<object>[]) => {
        this.selectionState$.next(this.computeSelectionState(records));
      });
  }

  /**
   * When the store change, create a new watcher
   * @internal
   */
  ngOnChanges(changes: SimpleChanges) {
    const store = changes.store;
    if (store && store.currentValue !== store.previousValue) {
      if (this.watcher !== undefined) {
        this.watcher.destroy();
      }
      this.watcher = new EntityStoreWatcher(this.store, this.cdRef);
    }
  }

  /**
   * Unbind the store watcher
   * @internal
   */
  ngOnDestroy() {
    if (this.watcher !== undefined) {
      this.watcher.destroy();
    }
    this.selection$$.unsubscribe();
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

  /**
   * On sort, sort the store
   * @param event Sort event
   * @internal
   */
  onSort(event: {active: string, direction: string}) {
    const direction = event.direction;
    const column = this.template.columns
      .find((c: EntityTableColumn) => c.name === event.active);

    if (direction === 'asc' || direction === 'desc') {
      this.store.view.sort({
        valueAccessor: (entity: object) => this.getValue(entity, column),
        direction,
        nullsFirst: this.sortNullsFirst
      });
    } else {
      this.store.view.sort(undefined);
    }
  }

  /**
   * When an entity is clicked, emit an event
   * @param entity Entity
   * @internal
   */
  onRowClick(entity: object) {
    this.entityClick.emit(entity);
  }

  /**
   * When an entity is selected, select it in the store and emit an event. Even if
   * "many" is set to true, this method always select a single, exclusive row. Selecting
   * multiple rows should be achieved by using the checkboxes.
   * @param entity Entity
   * @internal
   */
  onRowSelect(entity: object) {
    if (this.selection === false) { return; }

    // Selecting a
    this.store.state.update(entity, {selected: true}, true);
    this.entitySelectChange.emit({added: [entity]});
  }

  /**
   * Select or unselect all rows at once. On select, emit an event.
   * @param toggle Select or unselect
   * @internal
   */
  onToggleRows(toggle: boolean) {
    if (this.selection === false) { return; }

    this.store.state.updateAll({selected: toggle});
    if (toggle === true) {
      this.entitySelectChange.emit({added: [this.store.view.all()]});
    }
  }

  /**
   * When an entity is toggled, select or unselect it in the store. On select,
   * emit an event.
   * @param toggle Select or unselect
   * @param entity Entity
   * @internal
   */
  onToggleRow(toggle: boolean, entity: object) {
    if (this.selection === false) { return; }

    const exclusive = toggle === true && !this.selectMany;
    this.store.state.update(entity, {selected: toggle}, exclusive);
    if (toggle === true) {
      this.entitySelectChange.emit({added: [entity]});
    }
  }

  /**
   * Compute the selection state
   * @returns Whether all, some or no rows are selected
   * @internal
   */
  private computeSelectionState(selectedRecords: EntityRecord<object>[]): EntityTableSelectionState {
    const states = EntityTableSelectionState;
    const selectionCount = selectedRecords.length;
    return selectionCount === 0 ?
      states.None :
      (selectionCount === this.store.view.count ? states.All : states.Some);
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
   * @param entity Entity
   * @returns True if a row should be selected
   * @internal
   */
  rowIsSelected(entity: object): boolean {
    const state = this.store.state.get(entity);
    return state.selected ? state.selected : false;
  }

  /**
   * Method to access an entity's values
   * @param entity Entity
   * @param column Column
   * @returns Any value
   * @internal
   */
  getValue(entity: object, column: EntityTableColumn): any {
    if (column.valueAccessor !== undefined) {
      return column.valueAccessor(entity);
    }
    if (this.template.valueAccessor !== undefined) {
      return this.template.valueAccessor(entity, column.name);
    }
    return this.store.getProperty(entity, column.name);
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
  getTableClass(): {[key: string]: boolean} {
    return {
      'igo-entity-table-with-selection': this.selection
    };
  }

  /**
   * Return a header ngClass
   * @returns ngClass
   * @internal
   */
  getHeaderClass(): {[key: string]: boolean} {
    const func = this.template.headerClassFunc;
    if (func instanceof Function) {
      return func();
    }
    return {};
  }

  /**
   * Return a row ngClass
   * @param entity Entity
   * @returns ngClass
   * @internal
   */
  getRowClass(entity: object): {[key: string]: boolean} {
    const func = this.template.rowClassFunc;
    if (func instanceof Function) {
      return func(entity);
    }
    return {};
  }

  /**
   * Return a row ngClass
   * @param entity Entity
   * @param column Column
   * @returns ngClass
   * @internal
   */
  getCellClass(entity: object, column: EntityTableColumn): {[key: string]: boolean} {
    const cls = {};

    const tableFunc = this.template.cellClassFunc;
    if (tableFunc instanceof Function) {
      Object.assign(cls, tableFunc(entity, column));
    }

    const columnFunc = column.cellClassFunc;
    if (columnFunc instanceof Function) {
      Object.assign(cls, columnFunc(entity));
    }

    return cls;
  }

  /**
   * When a button is clicked
   * @param func Function
   * @param entity Entity
   * @internal
   */
  onButtonClick(clickFunc: (entity: object) => void, entity: object) {
    if (typeof clickFunc === 'function') {
      clickFunc(entity);
    }
  }

}
