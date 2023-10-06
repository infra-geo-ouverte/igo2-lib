import { EntityRecord, EntityTableColumn } from '../shared';

export const ENTIY_TABLE_COLUMN_MOCK: EntityTableColumn = {
  name: 'test',
  title: 'Test'
};

export const ENTIY_RECORD_MOCK: EntityRecord<any> = {
  entity: {},
  state: {},
  revision: 0,
  ref: 'test'
};
