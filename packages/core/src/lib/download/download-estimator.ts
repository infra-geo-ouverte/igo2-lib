import { Polygon } from '@turf/area/node_modules/@turf/helpers';
import { Geometry, LineString } from '@turf/helpers';
import { RegionDBData } from '../storage';
import { getNumberOfTilesLineStringIntersect, getPolygonOlArea, getTileOlArea } from './download-estimator-utils';
import { TileToDownload } from './download.interface';
import { getNumberOfTreeNodes, TileGenerationParams } from './tile-downloader';

export interface DownloadSizeEstimation {
    newAllocatedSize: number; // usefull to know if there is enough space left on update
    downloadSize: number;
}

export interface DownloadSizeEstimationInBytes {
    newAllocatedSize: number; // usefull to know if there is enough space left on update
    downloadSize: number;
}

export class DownloadEstimator {
    readonly averageBytesPerTile = 13375;
    constructor() {}

    estimateRegionDownloadSize(
        tilesToDownload: TileToDownload[],
        geometries: Geometry[],
        genParams: TileGenerationParams,
        tileGrid
    ): DownloadSizeEstimation {
        if (!geometries || !genParams) {
            return {
                newAllocatedSize: 0,
                downloadSize: 0
            };
        }

        if (tilesToDownload.length !== 0) {
            const nTilesToDownload: number = tilesToDownload.length;
            const nTiles = this.estimateNumberOfTiles(
                nTilesToDownload,
                genParams
            );
            return {
                newAllocatedSize: nTiles,
                downloadSize: nTiles
            };
        }
        return this.estimateNumberOfTilesDrawnRegionDownload(geometries,
            genParams,
            tileGrid
        );
    }

    estimateNumberOfTiles(
        nTilesToDownload: number,
        genParams: TileGenerationParams
    ) {
        const depth = genParams.endLevel - genParams.startLevel;
        const nTilesPerDownload = getNumberOfTreeNodes(depth);
        return nTilesToDownload * nTilesPerDownload;
    }

    estimateNumberOfTilesDrawnRegionDownload(
        geometries: Geometry[],
        genParams: TileGenerationParams,
        tileGrid
    ): DownloadSizeEstimation {
        let nTiles = 0;
        for (const geometry of geometries) {
            const tilesToDownload = this.estimateTilesOfGeometryAtLevel(
                geometry,
                genParams,
                tileGrid
            );
            nTiles += tilesToDownload;
        }
        return {
            newAllocatedSize: nTiles,
            downloadSize: nTiles
        };
    }

    public estimateRegionDownloadSizeInBytes(
        tilesToDownload: TileToDownload[],
        geometries: Geometry[],
        genParams: TileGenerationParams,
        tileGrid
    ): DownloadSizeEstimationInBytes {
        const estimation = this.estimateRegionDownloadSize(
            tilesToDownload,
            geometries,
            genParams,
            tileGrid
        );
        return this.downloadSizeEstimationInBytes(estimation);
    }

    estimateRegionUpdateSize(
        regionToUpdate: RegionDBData,
        tilesToDownload: TileToDownload[],
        geometries: Geometry[],
        tileGrid
    ): DownloadSizeEstimation {
        const genParams = regionToUpdate.generationParams;
        const newTilesEstimation = this.estimateRegionDownloadSize(
            tilesToDownload,
            geometries,
            genParams,
            tileGrid
        );
        const currentTiles = regionToUpdate.numberOfTiles;
        const newTiles = newTilesEstimation.downloadSize;
        return {
            newAllocatedSize: newTiles,
            downloadSize: newTiles + currentTiles
        };
    }

    estimateRegionUpdateSizeInBytes(
        regionToUpdate: RegionDBData,
        tilesToDownload: TileToDownload[],
        geometries: Geometry[],
        tileGrid
    ): DownloadSizeEstimationInBytes {
        const estimation = this.estimateRegionUpdateSize(
            regionToUpdate,
            tilesToDownload,
            geometries,
            tileGrid
        );
        return this.downloadSizeEstimationInBytes(estimation);
    }

    public downloadSizeEstimationInBytes(estimation: DownloadSizeEstimation)
    : DownloadSizeEstimationInBytes {
        return {
            downloadSize: estimation.downloadSize * this.averageBytesPerTile,
            newAllocatedSize: estimation.newAllocatedSize * this.averageBytesPerTile
        };
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
        const startLevel = genParams.startLevel;
        const endLevel = genParams.endLevel;
        let nTiles = 0;
        const geometryArea = getPolygonOlArea(geometry);
        console.log('geometry area', geometryArea);
        for (let level = startLevel; level <= endLevel; level++) {
            const areaPerTile = getTileOlArea(
                startingCoord,
                level,
                tileGrid
            );
            const maxTilesAtLevel = Math.ceil( geometryArea / areaPerTile) + 3;
            console.log('ratio', geometryArea / (areaPerTile));
            console.log('level:', level, ' tilearea:', areaPerTile, 'maxtiles@lvl:', maxTilesAtLevel);
            nTiles += maxTilesAtLevel;
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

        switch (geometry.type) {
            case 'Point':
                return this.getNumberOfTilesIntersectPoint(depth);

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

    public estimateSizeInBytes(numberOfTiles: number) {
        return numberOfTiles * this.averageBytesPerTile;
    }
}
