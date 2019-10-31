import { Observable } from 'rxjs';

import {
  EntityOperationType,
  EntityTableColumnRenderer
} from './entity.enums';
import { EntityStore } from './store';

export type EntityKey = string | number;

export interface EntityState {
  [key: string]: any;
}

export interface EntityRecord<E extends object, S extends EntityState = EntityState> {
  entity: E;
  state: S;
}

export interface EntityStoreOptions {
  getKey?: (entity: object) => EntityKey;
  getProperty?: (entity: object, property: string) => any;
}

export interface EntityStateManagerOptions {
  getKey?: (entity: object) => EntityKey;
  store?: EntityStore<object>;
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

export interface EntityOperation<E extends object = object> {
  key: EntityKey;
  type: EntityOperationType;
  previous: E | undefined;
  current: E | undefined;
  store?: EntityStore<E>;
  meta?: {[key: string]: any};
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
  valueAccessor?: (entity: object, property: string) => any;
  headerClassFunc?: () => {
    [key: string]: boolean;
  };
  rowClassFunc?: (entity: object) => {
    [key: string]: boolean;
  };
  cellClassFunc?: (entity: object, column: EntityTableColumn) => {
    [key: string]: boolean;
  };
}

export interface EntityTableColumn {
  name: string;
  title: string;
  renderer?: EntityTableColumnRenderer;
  valueAccessor?: (entity: object) => any;
  visible?: boolean;
  sort?: boolean;
  cellClassFunc?: (entity: object) => {
    [key: string]: boolean;
  };
}

export interface EntityTableButton {
  icon: string;
  click: (entity: object) => void;
  color?: 'primary' | 'accent' | 'warn';
  style?: 'mat-mini-fab' | 'mat-icon-button';
}
