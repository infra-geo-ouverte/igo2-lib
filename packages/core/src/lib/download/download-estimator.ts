import area from '@turf/area';
import { Geometry, LineString } from '@turf/helpers';
import { getNumberOfTilesLineStringIntersect, getTileArea } from './download-estimator-utils';
import { TileToDownload } from './download.interface';
import { getNumberOfTreeNodes, newTileGenerationStrategy, TileGenerationParams } from './tile-downloader';

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
                const nTiles: number = getNumberOfTilesLineStringIntersect(
                    geometry as LineString,
                    genParams.parentLevel,
                    tileGrid
                );
                const nTilesMax: number = nTiles;
                return nTilesMax * nTilesPerDownload;

            case 'Polygon':
                const startingCoord = geometry.coordinates[0][0];
                const areaPerTile = getTileArea(
                    startingCoord,
                    genParams.parentLevel,
                    tileGrid
                );
                const maxTiles = Math.ceil(area(geometry) / areaPerTile + 3);
                return maxTiles * nTilesPerDownload;

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