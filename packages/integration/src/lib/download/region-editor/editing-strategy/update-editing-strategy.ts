import { DownloadRegionService, RegionDBData, RegionUpdateParams } from '@igo2/core';
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

    get enableGenEdition() {
        return false;
    }
}
