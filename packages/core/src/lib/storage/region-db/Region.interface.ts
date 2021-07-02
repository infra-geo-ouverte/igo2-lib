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
}