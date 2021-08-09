import { DownloadRegionService, RegionDBData, RegionUpdateParams, TileGenerationParams, TileToDownload } from '@igo2/core';
import { Geometry } from '@turf/helpers';
import { RegionDownloadEstimationComponent } from '../region-download-estimation/region-download-estimation.component';
import { EditedRegion } from '../region-editor.state';
import { EditionStrategy } from './edition-strategy';


export class UpdateEditionStrategy extends EditionStrategy {

    constructor(readonly regionToUpdate: RegionDBData) {
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
        downloadEstimatorComponent: RegionDownloadEstimationComponent,
        tileToDownload: TileToDownload[],
        geometries: Geometry[],
        genParams: TileGenerationParams,
        tileGrid: any
    ): number {
        const updateSize = this.downloadEstimator.estimateRegionUpdateSize(
            this.regionToUpdate,
            tileToDownload,
            geometries,
            tileGrid
        );
        return updateSize.downloadSize;
    }

    get enableGenEdition() {
        return false;
    }
}
