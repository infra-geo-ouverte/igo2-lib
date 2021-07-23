import { Feature } from "@turf/helpers";
import { TileGenerationParams } from "./tile-downloader/tile-generation-strategies/tile-generation-params.interface";

export interface TileDownload {
    parentURL: string;
    urls: string[]; // usefull for delete region
}

export interface EditedRegion {
    name: string;
    urls: Set<string>;
    parentUrls: Array<string>;
    tiles: TileToDownload[];
    tileGrid: any;
    templateUrl: string;
    genParams: TileGenerationParams;
    features: Feature[];
}

export interface TileToDownload {
    url: string;
    coord: [ number, number, number ];
    featureText: string;
}
  
export interface RegionUpdateParams {
  name: string;
  newTiles: TileToDownload[];
  tileGrid;
  templateUrl;
}
