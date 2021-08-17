import { LineString, Position } from '@turf/helpers';
import * as olExtent from 'ol/extent';
import { Polygon } from 'ol/geom';
import * as olProj from 'ol/proj';
import { getTileGeometry } from './tile-downloader';
import { Tile } from './Tile.interface';

export function getTileOlArea(coord: [number, number], level: number, tileGrid): number {
    const tile: Tile = {
        X: coord[0],
        Y: coord[1],
        Z: level
    };
    const tileExtent = tileGrid.getTileCoordExtent([tile.Z, tile.X, tile.Y]);
    const area = olExtent.getArea(tileExtent);
    return area;
}

export function getPolygonOlArea(polygon) {
    const coords = [
        polygon.coordinates[0].map(
            coord => olProj.transform(coord, 'EPSG:4326', 'EPSG:3857')
        )
    ];
    const OlPolygon = new Polygon(coords);
    return OlPolygon.getArea();
}

export function gcd(a: number, b: number): number {
    if (b === 0) {
        return a;
    }
    return gcd(b, a % b);
}

export function getTileLength(tile: Tile, tileGrid): number {
    const tileGeometry = getTileGeometry(tile, tileGrid);
    const p0 = tileGeometry.coordinates[0][0];
    const p1 = tileGeometry.coordinates[0][1];
    let lengthSquared = 0;
    for (let dim = 0; dim < p0.length; dim++) {
        lengthSquared += (p1[dim] - p0[dim]) * (p1[dim] - p0[dim]);
    }
    const length = Math.sqrt(lengthSquared);
    return length;
}

export function getTileLengthFast(tile: Tile, tileGrid) {
    const tileGeometry = getTileGeometry(tile, tileGrid);
    const p0 = tileGeometry.coordinates[0][0];
    const p1 = tileGeometry.coordinates[0][1];
    const length = Math.abs(p0[0] - p1[0]) + Math.abs(p0[1] - p1[1]);
    return length;
}

export function getNumberOfTileLineIntersect(
    p0: Position,
    p1: Position,
    level: number,
    tileGrid
): number {
    const tile: Tile = {
        X: p0[0],
        Y: p0[1],
        Z: level
    };
    const tileLength = getTileLengthFast(tile, tileGrid);
    const transP0 = olProj.transform(p0, 'EPSG:4326', 'EPSG:3857');
    const transP1 = olProj.transform(p1, 'EPSG:4326', 'EPSG:3857');
    const dx: number = Math.ceil(Math.abs(transP1[0] - transP0[0]) / tileLength) + 1;
    const dy: number = Math.ceil(Math.abs(transP1[1] - transP0[1]) / tileLength) + 1;
    const nTiles = dx + dy - gcd(dx, dy);
    return nTiles;
}

export function transformTile(
    tile: Tile,
    inProj: string,
    outProj: string
): Tile {
    const coord = [tile.X, tile.Y];
    const transformedCoord = olProj.transform(coord, inProj, outProj);
    const X = transformedCoord[0];
    const Y = transformedCoord[1];
    const Z = tile.Z;
    return { X, Y, Z };
}

export function getNumberOfTilesLineStringIntersect(
    lineString: LineString,
    level: number,
    tileGrid
) {
    let tiles = 0;
    const coordinates = lineString.coordinates;
    const numberOfLines: number = coordinates.length - 1;
    for (let coord = 0; coord < numberOfLines; coord++) {
        const p0 = coordinates[coord];
        const p1 = coordinates[coord + 1];
        tiles += getNumberOfTileLineIntersect(p0, p1, level, tileGrid);
    }
    return tiles - numberOfLines + 1;
}
