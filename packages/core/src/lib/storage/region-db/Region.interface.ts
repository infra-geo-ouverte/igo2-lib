export interface Region {
  name: string;
  parentUrls: string[];
  parentFeatureText: string[];
  numberOfTiles: number;
}
export interface RegionDate extends Region {
  timestamp: Date;
}

export interface RegionTileDBData extends RegionDate {
  id: number;
  status: RegionStatus;
}

export enum RegionStatus {
  Downloading = 'Downloading',
  OK = 'OK',
  Expired = 'Expired'
} 
