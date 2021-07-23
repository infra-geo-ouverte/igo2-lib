import area from '@turf/area';
import { Geometry } from '@turf/helpers';
import { getTileArea } from './download-estimator-utils';
import { TileToDownload } from './download.interface';
import { getNumberOfTreeNodes, newTileGenerationStrategy, TileGenerationParams } from './tile-downloader';

export class DownloadEstimator {
    constructor() {}

    estimateDownloadSize(
        tilesToDownload: TileToDownload[],
        geometries: Geometry[],
        genParams: TileGenerationParams,
        tileGrid
    ) {
        console.log('tileToDownload', tilesToDownload);
        console.log('geometries', geometries);
        console.log(genParams);
        if (!geometries || !genParams) {
            return 0;
        }
        
        if (tilesToDownload.length !== 0) {
            const nTilesToDownload: number = tilesToDownload.length;
            return this.estimateNumberOfTiles(nTilesToDownload, genParams);
        }
        return this.estimateDrawnRegionDownloadSize(geometries, genParams, tileGrid)
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
        const tileGenerator = newTileGenerationStrategy(genParams.genMethod);
        const parentLevel = genParams.parentLevel;
        const depth = genParams.endLevel - genParams.startLevel;
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

    estimateTilesOfGeometryAtLevel(
        geometry: Geometry,
        genParams: TileGenerationParams,
        tileGrid
    ): number {
        const depth = genParams.endLevel - genParams.startLevel;
        if (Number.isNaN(depth)) {
            return 0;
        }
        const nTilesPerDownload = getNumberOfTreeNodes(depth);
        switch(geometry.type) {
            case 'Point':
                return depth;

            case 'LineString':
                const t = undefined; // Angle between tile and line
                const L = undefined; // Length of linestring
                const c = undefined; // Side length of tile
                const maxTile = Math.ceil(L*Math.cos(t)/c + 1);
                return maxTile * nTilesPerDownload;

            case 'Polygon':
                const startingCoord = geometry.coordinates[0][0];
                console.log('polygon starting coord', startingCoord);
                const areaPerTile = getTileArea(
                    startingCoord,
                    genParams.parentLevel,
                    tileGrid
                );
                const maxTiles = Math.ceil(area(geometry) / areaPerTile + 3);
                console.log('nTiles for polygon', maxTiles);
                return maxTiles * nTilesPerDownload;

            default:
                throw Error('Geometry type not supported for download size estimation');
        }
    }
}