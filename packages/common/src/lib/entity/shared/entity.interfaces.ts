import { Observable } from 'rxjs';

import { EntityTableColumnRenderer } from './entity.enums';

export type EntityKey = string | number;

export interface EntityState {
  [key: string]: any;
}

export interface EntityRecord<
  E extends object,
  S extends EntityState = EntityState
> {
  entity: E;
  state: S;
  revision: number;
  ref: string;
  edition?: boolean;
  newFeature?: any;
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
  headerClassFunc?: () => {
    [key: string]: boolean;
  };
  rowClassFunc?: (
    entity: object,
    record: EntityRecord<object>
  ) => {
    [key: string]: boolean;
  };
  cellClassFunc?: (
    entity: object,
    column: EntityTableColumn,
    record: EntityRecord<object>
  ) => {
    [key: string]: boolean;
  };
}

export interface EntityTableColumnValidation {
  readonly?: boolean;
  mandatory?: boolean;
  maxlength?: number;
  minlength?: number;
  minValue?: number;
  maxValue?: number;
}

export interface EntityRelation {
  table?: string;
  url?: string;
  params?: EntityRelationParam;
  choiceList?: {
    propertyGetter?: {
      list?: string;
      id: string;
      value: string;
    };
  };
}

export interface EntityRelationParam {
  name?: string;
  field: string;
}

export type EntityTableColumn = SelectEntityTableColumn | BaseEntityTableColumn;

export type SelectEntityTableColumn = ChoiceEntityField & BaseEntityTableColumn;

export interface BaseEntityTableColumn extends BaseEntityField {
  primary?: boolean;
  renderer?: EntityTableColumnRenderer;
  sort?: boolean;
  step?: number;
  title: string;
  tooltip?: string;
  validation?: EntityTableColumnValidation;
  visible?: boolean;
  cellClassFunc?: (
    entity: object,
    record: EntityRecord<object>
  ) => {
    [key: string]: boolean;
  };
  valueAccessor?: (entity: object, record: EntityRecord<object>) => any;
}

export type AnyEntityField = ChoiceEntityField | BaseEntityField;

export interface ChoiceEntityField extends BaseEntityField {
  domainValues?: Array<SelectOption>;
  labelField: string;
  type: 'list' | 'autocomplete';
}

interface BaseEntityField {
  multiple?: boolean;
  name: string;
  relation?: EntityRelation;
  type?: string;
}

export interface SelectOption {
  id: number | string;
  value: string | number;
}

export interface EntityTableButton {
  icon: string;
  click: (record: EntityRecord<object>) => void;
  color?: 'primary' | 'accent' | 'warn';
  disabled?: boolean;
  style?: 'mat-mini-fab' | 'mat-icon-button';
  editMode?: boolean;
}
