import { DownloadRegionService } from '@igo2/core';
import { EditedRegion } from '../region-editor.state';

export abstract class EditionStrategy {
    constructor() {}

    abstract estimateDownloadSizeInBytes(): number;
    abstract download(editedRegion: EditedRegion, regionDownloader: DownloadRegionService): void;

    abstract get downloadButtonTitle(): string;
    abstract get enableGenEdition(): boolean;
}
