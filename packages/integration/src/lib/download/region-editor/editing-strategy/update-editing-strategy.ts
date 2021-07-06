import { DownloadRegionService, RegionDBData, TileToDownload } from "@igo2/core"
import { EditedRegion } from "../region-editor.state";
import { EditionStrategy } from "./edition-strategy";

export class UpdateEditionStrategy extends EditionStrategy {
    
    constructor(region: RegionDBData) {
        super();
    }

    addTileToEditedRegion(tileToDownload: TileToDownload) {
        
    }

    get downloadButtonTitle(): string {
        return 'Update';
    }

    estimateDownloadSizeInBytes(): number {
        return 0;
    }

    download(editedRegion: EditedRegion) {
        
    }
}