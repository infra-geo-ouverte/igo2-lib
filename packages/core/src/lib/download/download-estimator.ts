import { Geometry } from "@turf/helpers";
import { TileToDownload } from "./download.interface";
import { getNumberOfTreeNodes, newTileGenerationStrategy, TileGenerationParams } from "./tile-downloader";

export class DownloadEstimator {
    constructor() {}

    estimateDownloadSize(tilesToDownload: TileToDownload[],
        geometries: Geometry[],
        genParams: TileGenerationParams,
        tileGrid
    ) {
        if (geometries || genParams) {
            return 0;
        }
        
        if (tilesToDownload.length === 0) {
            const nTilesToDownload: number = tilesToDownload.length;
            return this.estimateNumberOfTiles(nTilesToDownload, genParams);
        }
        return this.estimateDrawnRegionDownloadSize(geometries, genParams, tileGrid)
    }
    
    estimateNumberOfTiles(
        nTilesToDownload: number,
        genParam: TileGenerationParams
    ) {
        const depth = genParam.endLevel - genParam.startLevel;
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
        let nTiles = 0;
        for (const geometry of geometries) {
            const tiles = tileGenerator.getTilesFromFeatureAtLevel(
                geometry,
                parentLevel,
                tileGrid
            )
            nTiles += tiles.length;
        }
        return nTiles;
    }
}