export enum ChangeType {
  ADDED = 'added',
  DELETED = 'deleted',
  MODIFIED = 'modified'
}

export interface Change {
  type: ChangeType;
  keysChanged?: KeyChange[];
}

export interface KeyChange {
  key: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface GroupingChanges {
  added: ChangeItem[];
  deleted: ChangeItem[];
  modified: ChangeItem[];
}

export interface ChangeItem {
  change: Change;
  value: any;
  oldValue?: any;
  newValue?: any;
}
