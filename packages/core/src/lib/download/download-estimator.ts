import area from '@turf/area';
import { Polygon } from '@turf/area/node_modules/@turf/helpers';
import { Geometry, LineString } from '@turf/helpers';
import { getNumberOfTilesLineStringIntersect, getTileArea } from './download-estimator-utils';
import { TileToDownload } from './download.interface';
import { getNumberOfTreeNodes, TileGenerationParams } from './tile-downloader';

export class DownloadEstimator {
    readonly averageBytesPerTile = 13375;
    constructor() {}

    estimateDownloadSize(
        tilesToDownload: TileToDownload[],
        geometries: Geometry[],
        genParams: TileGenerationParams,
        tileGrid
    ) {
        if (!geometries || !genParams) {
            return 0;
        }

        if (tilesToDownload.length !== 0) {
            const nTilesToDownload: number = tilesToDownload.length;
            return this.estimateNumberOfTiles(nTilesToDownload, genParams);
        }
        return this.estimateDrawnRegionDownloadSize(geometries, genParams, tileGrid);
    }

    estimateNumberOfTiles(
        nTilesToDownload: number,
        genParams: TileGenerationParams
    ) {
        const depth = genParams.endLevel - genParams.startLevel;
        const nTilesPerDownload = getNumberOfTreeNodes(depth);
        return nTilesToDownload * nTilesPerDownload;
    }

    estimateDrawnRegionDownloadSize(
        geometries: Geometry[],
        genParams: TileGenerationParams,
        tileGrid
    ) {
        let nTiles = 0;
        for (const geometry of geometries) {
            const tilesToDownload = this.estimateTilesOfGeometryAtLevel(
                geometry,
                genParams,
                tileGrid
            );
            nTiles += tilesToDownload;
        }
        return nTiles;
    }

    private getNumberOfTilesIntersectPoint(depth: number): number {
        return depth + 1;
    }

    private getNumberOfTilesIntersectLineString(
        geometry: LineString,
        genParams: TileGenerationParams,
        tileGrid
    ): number {
        const startLevel = genParams.startLevel;
        const endLevel = genParams.endLevel;
        let nTiles = 0;
        for (let level = startLevel; level <= endLevel; level++) {
            nTiles += getNumberOfTilesLineStringIntersect(
                geometry as LineString,
                level,
                tileGrid
            );
        }
        return nTiles;
    }

    private getNumberOfTilesIntersectPolygon(
        geometry: Polygon,
        genParams: TileGenerationParams,
        tileGrid
    ): number {
        const startingPosition = geometry.coordinates[0][0];
        const startingCoord: [number, number] = [startingPosition[0], startingPosition[1]];
        const areaPerTile = getTileArea(
            startingCoord,
            genParams.parentLevel,
            tileGrid);

        const maxTiles = Math.ceil(area(geometry) / areaPerTile + 3);

        const depth = genParams.endLevel - genParams.startLevel;
        const nTilesPerDownload= getNumberOfTreeNodes(depth)
        return maxTiles * nTilesPerDownload;
    }

    estimateTilesOfGeometryAtLevel(
        geometry: Geometry,
        genParams: TileGenerationParams,
        tileGrid
    ): number {
        const depth = genParams.endLevel - genParams.startLevel;
        if (Number.isNaN(depth)) {
            return 0;
        }

        switch (geometry.type) {
            case 'Point':
                return this.getNumberOfTilesIntersectPoint(depth)

            case 'LineString':
                return this.getNumberOfTilesIntersectLineString(
                    geometry as LineString,
                    genParams,
                    tileGrid);

            case 'Polygon':
                return this.getNumberOfTilesIntersectPolygon(
                    geometry as Polygon,
                    genParams,
                    tileGrid);

            default:
                throw Error('Geometry type not supported for download size estimation');
        }
    }

    public estimateDownloadSizeInBytes(
        tilesToDownload: TileToDownload[],
        geometries: Geometry[],
        genParams: TileGenerationParams,
        tileGrid
    ) {
        const nTiles = this.estimateDownloadSize(
            tilesToDownload,
            geometries,
            genParams,
            tileGrid
        );
        return nTiles * this.averageBytesPerTile;
    }
}
