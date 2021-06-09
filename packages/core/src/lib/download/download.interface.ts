export interface Region {
    name: string;
    zIndex: number;
    depth: number;
    lastUpdateDate: Date;
    downloadedTiles: TileDownload[];
}

export interface TileDownload {
    parentURL: string;
    urls: string[]; // usefull for delete region
}
