import TileGrid from 'ol/tilegrid/TileGrid';
export interface TransferedTile {
    coord: [number, number, number];
    templateUrl: string;
    tileGrid: TileGrid
}
