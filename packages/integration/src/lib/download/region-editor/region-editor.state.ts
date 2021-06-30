import { Injectable } from '@angular/core';
import { TileToDownload } from '@igo2/core/public_api';
import { Feature } from '@igo2/geo/public_api';
import { Observable } from 'rxjs';

export interface EditedRegion {
    name: string;
    urls: Set<string>;
    tiles: TileToDownload[];
    depth: number;
    features: Feature[];
}

function newEditedRegion(): EditedRegion {
    return {
        name: undefined,
        urls: new Set(),
        tiles: new Array(),
        depth: 0,
        features: new Array()
    }
}

@Injectable({
   providedIn: 'root'
 })
export class RegionEditorState {
    private editedRegion: EditedRegion = newEditedRegion();
    progression$: Observable<number>;
    isDownloading: boolean;
    
    constructor() {}

    set regionName(name: string) {
        this.editedRegion.name = name;
    }

    get regionName(): string {
        return this.editedRegion.name;
    }

    set urlsToDownload(urls: Set<string>) {
        this.editedRegion.urls = urls;
    }

    get urlsToDownload(): Set<string> {
        return this.editedRegion.urls;
    }

    set tilesToDownload(tiles: TileToDownload[]) {
        this.editedRegion.tiles = tiles;
    }

    get tilesToDownload(): TileToDownload[] {
        return this.editedRegion.tiles;
    }

    set depth(depth: number) {
        this.editedRegion.depth = depth;
    }

    get depth(): number {
        return this.editedRegion.depth;
    }

    set editedTilesFeatures(features: Feature[]) {
        this.editedRegion.features = features;
    }

    get editedTilesFeatures(): Feature[] {
        return this.editedRegion.features;
    }
}
