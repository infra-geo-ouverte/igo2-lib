import { DownloadRegionService, RegionDBData } from "@igo2/core"
import { EditedRegion } from "../region-editor.state";
import { EditionStrategy } from "./edition-strategy";

// function newEditedRegion(): EditedRegion {
//     return {
//         name: undefined,
//         urls: new Set(),
//         tiles: new Array(),
//         depth: 0,
//         features: new Array()
//     }
// }

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
        console.log("create strategy download");
        regionDownloader.downloadSelectedRegion(
            editedRegion.tiles,
            editedRegion.name,
            editedRegion.depth
        );
    }

    get enableGenEdition() {
        return true;
    }
}
