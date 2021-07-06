import { TileGenerationParams } from "../../download/tile-downloader/tile-generation-strategies/tile-generation-params.interface";

export interface Region {
  name: string;
  status: RegionStatus
  parentUrls: string[];
  parentFeatureText: string[];
  numberOfTiles: number;
}

export interface RegionDate extends Region {
  timestamp: Date;
}

export interface RegionDBData extends RegionDate {
  id: number;
  generationParams: TileGenerationParams
}

export enum RegionStatus {
  Downloading = 'Downloading',
  OK = 'OK',
  Expired = 'Expired'
}
