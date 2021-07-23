import area from "@turf/area";
import { getTileGeometry } from "./tile-downloader";
import { Tile } from "./Tile.interface";

export function getTileArea(coord: [number, number], level: number, tileGrid): number {
    const tile: Tile = {
        X: coord[0],
        Y: coord[1],
        Z: level
    }
    const tileGeometry = getTileGeometry(tile, tileGrid);
    const tileArea = area(tileGeometry);
    console.log('tileArea', tileArea);
    return area(tileGeometry);
}
