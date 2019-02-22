export enum ChangeType {
  ADDED = 'added',
  DELETED = 'deleted',
  MODIFIED = 'modified'
}

export interface Change {
  type: ChangeType;
  keysChanged?: {
    key: string;
    newValue: any;
    oldValue: any;
  }[];
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
