import { DownloadRegionService, RegionDBData } from "@igo2/core"
import { EditedRegion } from "../region-editor.state";

export abstract class EditionStrategy {
    constructor() {}
    
    // abstract set editedRegion(region: EditedRegion);
    abstract get downloadButtonTitle(): string;
    abstract estimateDownloadSizeInBytes(): number;
    abstract download(editedRegion: EditedRegion): void;
}