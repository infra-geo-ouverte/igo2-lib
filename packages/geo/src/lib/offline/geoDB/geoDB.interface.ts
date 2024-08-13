import { InsertSourceInsertDBEnum } from './geoDB.enums';

export interface GeoDBData {
  url: string;
  regionIDs: string[];
  object: any;
  compressed: boolean;
  insertSource: InsertSourceInsertDBEnum;
  insertEvent: string;
}

export interface GeoDataToIDB {
  triggerDate: Date | string;
  action: 'delete' | 'update';
  urls: string[];
  source?: string;
  zippedBaseUrl?: string;
}

export interface DatasToIDB {
  geoDatas: GeoDataToIDB[];
}
