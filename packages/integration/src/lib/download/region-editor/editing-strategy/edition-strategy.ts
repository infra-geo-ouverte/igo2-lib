import { DownloadEstimator, DownloadRegionService } from '@igo2/core';
import { EditedRegion } from '../region-editor.state';

export abstract class EditionStrategy {
    protected downloadEstimator = new DownloadEstimator();
    constructor() {}

    abstract download(editedRegion: EditedRegion, regionDownloader: DownloadRegionService): void;
    abstract cancelDownload(regionDownloader: DownloadRegionService): void;

    abstract get downloadButtonTitle(): string;
    abstract get enableGenEdition(): boolean;
}
