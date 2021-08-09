import { DownloadRegionService, TileGenerationParams, TileToDownload } from '@igo2/core';
import { Geometry } from '@turf/helpers';
import { RegionDownloadEstimationComponent } from '../region-download-estimation/region-download-estimation.component';
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

    estimateRegionDownloadSize(
        downloadEstimatorComponent: RegionDownloadEstimationComponent,
        tileToDownload: TileToDownload[],
        geometries: Geometry[],
        genParams: TileGenerationParams,
        tileGrid: any
    ): number {
        return this.downloadEstimator.estimateRegionDownloadSize(
            tileToDownload,
            geometries,
            genParams,
            tileGrid
        ).downloadSize;
    }

    get enableGenEdition() {
        return true;
    }
}
