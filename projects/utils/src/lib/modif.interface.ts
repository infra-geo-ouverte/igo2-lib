export enum ModifType {
  ADDED = 'added',
  DELETED = 'deleted',
  MODIFIED = 'modified'
}

export interface Modif {
  type: ModifType;
  oldValue?: any;
  newValue?: any;
  keysChanged?: {
    key: string;
    newValue: any;
    oldValue: any;
  }[];
}

export interface ModifRegroupement {
  added: ModifItem[];
  deleted: ModifItem[];
  modified: ModifItem[];
}

export interface ModifItem {
  modif: Modif;
  value: any;
}
