import { Geometry } from '@turf/helpers';
import { Polygon } from 'geojson';
import { Tile } from '../../Tile.interface';
import { tileInsidePolygon } from './tile-generation.utils';


export abstract class TileGenerationStrategy {
    constructor() {}

    getTilesFromGeometriesAtLevel(geometries: Geometry[], level: number, tileGrid): Tile[] {
        if (!geometries) {
            return [];
        }

        let tiles: Tile[] = new Array();
        geometries.forEach((geometry: Geometry) => {
            tiles = tiles.concat(this.getTilesFromFeatureAtLevel(geometry, level, tileGrid));
        });
        return tiles;
    }

    getTilesFromFeatureAtLevel(geometry: Geometry, level: number, tileGrid): Tile[] {
        if (!geometry) {
            return;
        }

        if (geometry.type === 'Point') {
            const coord = tileGrid.getTileCoordForCoordAndZ(geometry.coordinates, level);
            return [{
                Z: coord[0],
                X: coord[1],
                Y: coord[2]
            }];
        }

        const coords = geometry.type === 'LineString' ?
            geometry.coordinates :
            (geometry as Polygon).coordinates[0];

        const startPoint = coords[0];
        const firstCoord = tileGrid.getTileCoordForCoordAndZ(startPoint, level);
        const firstTile: Tile = {
            Z: firstCoord[0],
            X: firstCoord[1],
            Y: firstCoord[2]
        };

        const tilesCoveringPolygon: Tile[] = new Array();
        const tileToVisit: Tile[] = [firstTile];
        const visitedTiles: Set<string> = new Set();
        while (tileToVisit.length !== 0) {
            const currentTile: Tile = tileToVisit.shift();
            const currentTileString = JSON.stringify(currentTile);

            if (!visitedTiles.has(currentTileString) &&
                tileInsidePolygon(geometry, currentTile, tileGrid)
            ) {
                tilesCoveringPolygon.push(currentTile);

                const top = {
                  Z: currentTile.Z,
                  X: currentTile.X,
                  Y: currentTile.Y - 1
                };
                if (!visitedTiles.has(JSON.stringify(top))) {
                  tileToVisit.push(top);
                }

                const bottom = {
                  Z: currentTile.Z,
                  X: currentTile.X,
                  Y: currentTile.Y + 1
                };
                if (!visitedTiles.has(JSON.stringify(bottom))) {
                  tileToVisit.push(bottom);
                }

                const right = {
                  Z: currentTile.Z,
                  X: currentTile.X + 1,
                  Y: currentTile.Y
                };
                if (!visitedTiles.has(JSON.stringify(right))) {
                  tileToVisit.push(right);
                }

                const left = {
                  Z: currentTile.Z,
                  X: currentTile.X - 1,
                  Y: currentTile.Y
                };
                if (!visitedTiles.has(JSON.stringify(left))) {
                  tileToVisit.push(left);
                }
            }
            visitedTiles.add(currentTileString);
        }
        return tilesCoveringPolygon;
    }

    generateFromGeometries(geometries: Geometry[], startLevel: number, endLevel: number, tileGrid): Tile[] {
      let tiles: Tile[] = new Array();
      for (let level = startLevel; level <= endLevel; level++) {
          tiles = tiles.concat(this.getTilesFromGeometriesAtLevel(geometries, level, tileGrid));
      }
      return tiles;
    }

    abstract generate(tile: Tile, startLevel: number, endLevel: number): Tile[];
    abstract getNumberOfTiles(tile: Tile, startLevel: number, endLevel: number)
        : number;
}
