import { DownloadEstimator, DownloadRegionService, TileGenerationParams, TileToDownload } from '@igo2/core';
import { Geometry } from '@turf/helpers';
import { EditedRegion } from '../region-editor.state';

export abstract class EditionStrategy {
    protected downloadEstimator = new DownloadEstimator();
    constructor() {}

    abstract download(editedRegion: EditedRegion, regionDownloader: DownloadRegionService): void;
    abstract cancelDownload(regionDownloader: DownloadRegionService): void;
    abstract estimateRegionDownloadSize(
        tileToDownload: TileToDownload[],
        geometry: Geometry[],
        genParams: TileGenerationParams,
        tileGrid: any
    ): number;
    abstract estimateRegionDownloadSizeInBytes(
        tileToDownload: TileToDownload[],
        geometries: Geometry[],
        genParams: TileGenerationParams,
        tileGrid: any
    ): number;

    abstract get downloadButtonTitle(): string;
    abstract get enableGenEdition(): boolean;
}
