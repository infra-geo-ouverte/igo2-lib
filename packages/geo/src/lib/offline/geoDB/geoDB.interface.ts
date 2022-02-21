import { InsertSourceInsertDBEnum } from "./geoDB.enums";

export interface GeoDBData {
    url: string;
    regionID: number;
    object: any;
    compressed: boolean;
    insertSource: InsertSourceInsertDBEnum;
    insertEvent: string;
}
