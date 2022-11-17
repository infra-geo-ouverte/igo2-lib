import { InsertSourceInsertDBEnum } from "./geoDB.enums";

export interface GeoDBData {
    url: string;
    regionID: any;
    object: any;
    compressed: boolean;
    insertSource: InsertSourceInsertDBEnum;
    insertEvent: string;
}

export interface GeoDataToIDB {
  triggerDate: Date | string;
  action: "delete" | 'update';
  urls: string[];
  source?: string;
}

export interface DatasToIDB {
  geoDatas: GeoDataToIDB[]
}
