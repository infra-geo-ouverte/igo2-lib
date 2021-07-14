import { DownloadRegionService } from '@igo2/core';
import { EditedRegion } from '../region-editor.state';
import { EditionStrategy } from './edition-strategy';

export class CreationEditionStrategy extends EditionStrategy {
    constructor() {
        super();
    }

    get downloadButtonTitle(): string {
        return 'Download';
    }

    estimateDownloadSizeInBytes(): number {
        return 0;
    }

    download(editedRegion: EditedRegion, regionDownloader: DownloadRegionService) {
        console.log('create strategy download');
        regionDownloader.downloadSelectedRegion(
            editedRegion.tiles,
            editedRegion.name,
            editedRegion.genParams
        );
    }

    get enableGenEdition() {
        return true;
    }
}
