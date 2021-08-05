import { DownloadRegionService, RegionDBData, RegionUpdateParams, TileGenerationParams, TileToDownload } from '@igo2/core';
import { Geometry } from '@turf/helpers';
import { EditedRegion } from '../region-editor.state';
import { EditionStrategy } from './edition-strategy';


export class UpdateEditionStrategy extends EditionStrategy {

    constructor(private regionToUpdate: RegionDBData) {
        super();
    }

    get downloadButtonTitle(): string {
        return 'Update';
    }

    download(editedRegion: EditedRegion, regionDownloader: DownloadRegionService) {
        console.log('update strategy download');
        const updateParams: RegionUpdateParams = {
            name: editedRegion.name,
            newTiles: editedRegion.tiles,
            tileGrid: editedRegion.tileGrid,
            templateUrl: editedRegion.templateUrl
        };
        regionDownloader.updateRegion(this.regionToUpdate, updateParams);
    }

    cancelDownload(regionDownloader: DownloadRegionService) {
        regionDownloader.cancelRegionUpdate();
    }

    estimateRegionDownloadSize(
        tileToDownload: TileToDownload[],
        geometries: Geometry[],
        genParams: TileGenerationParams,
        tileGrid: any
    ): number {
        return this.downloadEstimator.estimateDownloadSize(
            tileToDownload,
            geometries,
            genParams,
            tileGrid
        );
    }

    estimateRegionDownloadSizeInBytes(
        tileToDownload: TileToDownload[],
        geometries: Geometry[],
        genParams: TileGenerationParams,
        tileGrid: any
    ): number {
        return this.downloadEstimator.estimateRegionDownloadSizeInBytes(
            tileToDownload,
            geometries,
            genParams,
            tileGrid
        );
    }

    get enableGenEdition() {
        return false;
    }
}
