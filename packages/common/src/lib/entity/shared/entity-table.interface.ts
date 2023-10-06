import { EntityRecord, EntityState } from './entity.interfaces';

export interface CellData {
  [key: string]: {
    value: any;
    class: { [key: string]: boolean };
  };
}

export interface RowData {
  record: EntityRecord<object, EntityState>;
  cellData: CellData;
}
