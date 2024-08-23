import { Observable } from 'rxjs';

import { EntityTableColumnRenderer } from './entity.enums';

export type EntityKey = string | number;

export type EntityState = Record<string, any>;

export interface EntityRecord<
  E extends object,
  S extends EntityState = EntityState
> {
  entity: E;
  state: S;
  revision: number;
  ref: string;
  edition?: boolean;
}

export interface EntityStoreStrategyOptions {}

export interface EntityStoreStrategyFuncOptions
  extends EntityStoreStrategyOptions {
  filterClauseFunc: EntityFilterClause;
}

export interface EntityTransactionOptions {
  getKey?: (entity: object) => EntityKey;
}

export type EntityFilterClause<E = object> = (entity: E) => boolean;

export interface EntitySortClause<E = object> {
  valueAccessor: (entity: E) => string | number;
  direction: string;

  // If true, null and undefined values will be first
  // If false, null and undefined values will be last
  // If undefined, default to true and false when sorting in descending and
  // ascending order, respectively
  nullsFirst?: boolean;
}

export interface EntityJoinClause {
  source: Observable<any | void>;
  reduce: (param1: object, param2: any) => object;
}

export interface EntityOperationState {
  added: boolean;
  canceled: boolean;
}

export interface EntityTableTemplate {
  columns: EntityTableColumn[];
  selection?: boolean;
  selectionCheckbox?: boolean;
  selectMany?: boolean;
  sort?: boolean;
  fixedHeader?: boolean;
  tableHeight?: string;
  valueAccessor?: (
    entity: object,
    property: string,
    record: EntityRecord<object>
  ) => any;
  headerClassFunc?: () => Record<string, boolean>;
  rowClassFunc?: (
    entity: object,
    record: EntityRecord<object>
  ) => Record<string, boolean>;
  cellClassFunc?: (
    entity: object,
    column: EntityTableColumn,
    record: EntityRecord<object>
  ) => Record<string, boolean>;
}

export interface EntityTableColumnValidation {
  readonly?: boolean;
  mandatory?: boolean;
  maxlength?: number;
  minlength?: number;
  minValue?: number;
  maxValue?: number;
}

export interface TableRelation {
  table: string;
}

export interface EntityTableColumn {
  validation?: EntityTableColumnValidation;
  name: string;
  title: string;
  renderer?: EntityTableColumnRenderer;
  valueAccessor?: (entity: object, record: EntityRecord<object>) => any;
  visible?: boolean;
  linkColumnForce?: string;
  sort?: boolean;
  type?: string;
  multiple?: boolean;
  domainValues?: SelectOption[];
  relation?: TableRelation;
  tooltip?: string;
  cellClassFunc?: (
    entity: object,
    record: EntityRecord<object>
  ) => Record<string, boolean>;
  step?: number;
  icon?: string;
  onBlur?: (event: Event) => void;
  onChange?: (event: Event) => void;
  onClick?: (event: Event) => void;
  onFocus?: (event: Event) => void;
}

export interface SelectOption {
  id: number;
  value: string;
  disabled?: boolean;
}

export interface EntityTableButton {
  icon: string;
  click: (entity: object, record: EntityRecord<object>) => void;
  color?: 'primary' | 'accent' | 'warn';
  disabled?: boolean;
  style?: 'mat-mini-fab' | 'mat-icon-button';
  editMode?: boolean;
}
