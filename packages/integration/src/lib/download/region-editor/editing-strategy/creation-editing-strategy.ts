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

    download(editedRegion: EditedRegion, regionDownloader: DownloadRegionService) {
        if (editedRegion.parentUrls.length === 0) {
            const featuresText = editedRegion.features.map(feature => JSON.stringify(feature));
            const geometries = editedRegion.features.map(feature => feature.geometry);
            regionDownloader.downloadRegionFromFeatures(
                featuresText,
                geometries,
                editedRegion.name,
                editedRegion.genParams,
                editedRegion.tileGrid,
                editedRegion.templateUrl
            );
        } else {
            regionDownloader.downloadSelectedRegion(
                editedRegion.tiles,
                editedRegion.name,
                editedRegion.genParams,
                editedRegion.tileGrid,
                editedRegion.templateUrl
            );
        }
    }

    cancelDownload(regionDownloader: DownloadRegionService) {
        regionDownloader.cancelRegionDownload();
    }

    get enableGenEdition() {
        return true;
    }
}
